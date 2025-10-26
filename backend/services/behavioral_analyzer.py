import cv2
import numpy as np
from typing import Dict, Any, List
import tempfile
import os
from datetime import datetime

class BehavioralAnalyzer:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        self._genai = None
        self._llm = None
        try:
            import google.generativeai as genai
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                genai.configure(api_key=api_key)
                self._genai = genai
                self._llm = genai.GenerativeModel('gemini-2.0-flash-exp')
        except Exception:
            pass
        
    async def analyze_video(self, video_file) -> Dict[str, Any]:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp_file:
            content = await video_file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        try:
            if self._llm:
                try:
                    return await self._analyze_video_llm(tmp_file_path)
                except Exception:
                    pass
            analysis_results = self._process_video(tmp_file_path)
            os.unlink(tmp_file_path)
            return analysis_results
        except Exception as e:
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
            raise e

    async def analyze_chunk(self, image_b64: str | None, audio_b64: str | None, transcript_segment: str | None) -> Dict[str, Any]:
        if self._llm:
            try:
                return await self._llm_analyze(image_b64, audio_b64, transcript_segment)
            except Exception:
                pass
        frame_metrics = {}
        if image_b64:
            import base64, io
            img = base64.b64decode(image_b64)
            data = np.frombuffer(img, dtype=np.uint8)
            frame = cv2.imdecode(data, cv2.IMREAD_COLOR)
            frame_metrics = self._analyze_frame(frame)
        return {
            "speech_clarity": 0.0,
            "tone_confidence": 0.0,
            "emotional_stability": 0.0,
            "eye_contact": bool(frame_metrics.get("eye_contact", False)),
            "eye_contact_score": 100.0 if frame_metrics.get("eye_contact") else 0.0,
            "facial_expression": "neutral",
            "engagement_level": 0.0,
            "star": {"situation": False, "task": False, "action": False, "result": False, "completeness": 0.0},
            "suggestions": ["Maintain steady eye contact", "Sit centered in frame"],
        }

    async def _analyze_video_llm(self, video_path: str) -> Dict[str, Any]:
        if not self._llm:
            return self._process_video(video_path)
        try:
            with open(video_path, 'rb') as f:
                video_bytes = f.read()
            parts = [
                {
                    "inlineData": {
                        "data": video_bytes,
                        "mimeType": "video/mp4",
                    }
                }
            ]
            prompt = (
                "You are an expert behavioral interview coach. Analyze the provided interview recording. "
                "Track over time: speech clarity, tone confidence, emotional stability, eye contact, facial expressions, engagement. "
                "Transcribe the candidate’s responses and evaluate STAR framework completeness per answer. "
                "Return ONLY strict JSON with keys: "
                "{overall:{confidence_score, eye_contact_score, posture_score, speech_clarity}, "
                "trends:{emotion:[{t,score}], focus:[{t,score}], responseQuality:[{t,score}]}, "
                "segments:[{tStart,tEnd, transcript, star:{situation,task,action,result,completeness}, metrics:{clarity,confidence,engagement,emotion}}], "
                "feedback:{overall:string, improvements:string[]}}"
            )
            resp = self._llm.generate_content([prompt] + parts)
            text = resp.text if hasattr(resp, 'text') else getattr(resp, 'response', {}).get('text', '')
            import json as _json
            data = _json.loads(text)
            # Map to API shape (ensure required top-level keys exist)
            overall = data.get("overall", {})
            feedback = data.get("feedback", {"overall": "", "improvements": []})
            return {
                "confidence_score": float(overall.get("confidence_score", 0.0)),
                "eye_contact_score": float(overall.get("eye_contact_score", 0.0)),
                "posture_score": float(overall.get("posture_score", 0.0)),
                "speech_clarity": float(overall.get("speech_clarity", 0.0)),
                "overall_feedback": feedback.get("overall", ""),
                "improvements": feedback.get("improvements", []),
                "trends": data.get("trends", {"emotion": [], "focus": [], "responseQuality": []}),
                "segments": data.get("segments", []),
            }
        except Exception:
            return self._process_video(video_path)

    async def _llm_analyze(self, image_b64: str | None, audio_b64: str | None, transcript_segment: str | None) -> Dict[str, Any]:
        import json as _json
        parts = []
        if image_b64:
            parts.append({"inlineData": {"data": image_b64, "mimeType": "image/jpeg"}})
        if audio_b64:
            parts.append({"inlineData": {"data": audio_b64, "mimeType": "audio/webm"}})
        prompt = (
            "You are an expert behavioral interview coach analyzing this live frame. "
            "Evaluate the candidate's eye contact (looking at camera), posture, facial expressions, and engagement. "
            "Return ONLY JSON with exact structure: "
            "{\"speech_clarity\":0-100, \"tone_confidence\":0-100, \"emotional_stability\":0-100, "
            "\"eye_contact\": true/false, \"eye_contact_score\":0-100, \"facial_expression\":\"string\", \"engagement_level\":0-100, "
            "\"star\":{\"situation\":false, \"task\":false, \"action\":false, \"result\":false, \"completeness\":0}, "
            "\"suggestions\":[]}. Focus on visual cues: is the person looking directly at camera (high eye_contact_score), "
            "are they centered in frame, do they appear confident and engaged?"
        )
        if transcript_segment:
            prompt += f" Transcript: {transcript_segment[:1000]}"
        try:
            resp = self._llm.generate_content([prompt] + parts)
            text = resp.text if hasattr(resp, 'text') else str(resp)
            text = text.strip()
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            text = text.strip()
            data = _json.loads(text)
            return data
        except Exception as e:
            return {
                "speech_clarity": 50.0,
                "tone_confidence": 50.0,
                "emotional_stability": 50.0,
                "eye_contact": False,
                "eye_contact_score": 0.0,
                "facial_expression": "neutral",
                "engagement_level": 50.0,
                "star": {"situation": False, "task": False, "action": False, "result": False, "completeness": 0.0},
                "suggestions": ["Look at the camera", "Sit centered in frame"],
            }
    
    def _process_video(self, video_path: str) -> Dict[str, Any]:
        """Process video file for behavioral analysis"""
        
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError("Could not open video file")
        
        # Video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        
        # Analysis variables
        eye_contact_frames = 0
        face_detected_frames = 0
        posture_scores = []
        speech_analysis = {
            "speaking_time": 0,
            "silence_time": 0,
            "speech_clarity": 0.0
        }
        
        frame_count = 0
        sample_rate = max(1, int(fps / 2))  # Sample every 0.5 seconds
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % sample_rate == 0:
                # Analyze frame
                frame_analysis = self._analyze_frame(frame)
                
                if frame_analysis["face_detected"]:
                    face_detected_frames += 1
                    
                    if frame_analysis["eye_contact"]:
                        eye_contact_frames += 1
                    
                    posture_scores.append(frame_analysis["posture_score"])
            
            frame_count += 1
        
        cap.release()
        
        # Calculate final scores
        eye_contact_score = (eye_contact_frames / max(face_detected_frames, 1)) * 100
        posture_score = np.mean(posture_scores) if posture_scores else 0
        confidence_score = self._calculate_confidence_score(eye_contact_score, posture_score)
        
        # Generate feedback
        feedback = self._generate_feedback(eye_contact_score, posture_score, confidence_score)
        
        return {
            "confidence_score": round(confidence_score, 2),
            "eye_contact_score": round(eye_contact_score, 2),
            "posture_score": round(posture_score, 2),
            "speech_clarity": round(speech_analysis["speech_clarity"], 2),
            "overall_feedback": feedback["overall"],
            "improvements": feedback["improvements"],
            "analysis_metadata": {
                "video_duration": round(duration, 2),
                "frames_analyzed": len(posture_scores),
                "face_detection_rate": round((face_detected_frames / max(frame_count // sample_rate, 1)) * 100, 2)
            }
        }
    
    def _analyze_frame(self, frame) -> Dict[str, Any]:
        """Analyze a single frame for behavioral indicators"""
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Face detection
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        face_detected = len(faces) > 0
        
        eye_contact = False
        posture_score = 0.0
        
        if face_detected:
            # Get the largest face
            largest_face = max(faces, key=lambda x: x[2] * x[3])
            x, y, w, h = largest_face
            
            # Extract face region
            face_roi = gray[y:y+h, x:x+w]
            
            # Eye detection
            eyes = self.eye_cascade.detectMultiScale(face_roi, 1.1, 4)
            eye_contact = len(eyes) >= 2
            
            # Posture analysis (simplified)
            posture_score = self._analyze_posture(frame, largest_face)
        
        return {
            "face_detected": face_detected,
            "eye_contact": eye_contact,
            "posture_score": posture_score
        }
    
    def _analyze_posture(self, frame, face_rect) -> float:
        """Analyze posture based on face position and orientation"""
        
        x, y, w, h = face_rect
        frame_height, frame_width = frame.shape[:2]
        
        # Calculate face position relative to frame
        face_center_x = x + w // 2
        face_center_y = y + h // 2
        
        # Ideal face position (center of frame, upper third)
        ideal_x = frame_width // 2
        ideal_y = frame_height // 3
        
        # Calculate deviation from ideal position
        x_deviation = abs(face_center_x - ideal_x) / (frame_width // 2)
        y_deviation = abs(face_center_y - ideal_y) / (frame_height // 2)
        
        # Calculate posture score (0-100)
        position_score = max(0, 100 - (x_deviation + y_deviation) * 50)
        
        # Check if face is roughly centered
        is_centered = x_deviation < 0.3 and y_deviation < 0.3
        
        # Check face size (not too close, not too far)
        face_area = w * h
        frame_area = frame_width * frame_height
        face_ratio = face_area / frame_area
        
        size_score = 100 if 0.05 < face_ratio < 0.25 else max(0, 100 - abs(face_ratio - 0.15) * 1000)
        
        # Combine scores
        posture_score = (position_score * 0.6 + size_score * 0.4) if is_centered else position_score * 0.8
        
        return min(100, max(0, posture_score))
    
    def _calculate_confidence_score(self, eye_contact_score: float, posture_score: float) -> float:
        """Calculate overall confidence score"""
        
        # Weighted average with emphasis on eye contact
        confidence = (eye_contact_score * 0.6 + posture_score * 0.4)
        
        # Apply bonus for high scores
        if eye_contact_score > 80 and posture_score > 80:
            confidence = min(100, confidence * 1.1)
        
        return confidence
    
    def _generate_feedback(self, eye_contact_score: float, posture_score: float, confidence_score: float) -> Dict[str, Any]:
        """Generate feedback based on analysis scores"""
        
        improvements = []
        
        # Eye contact feedback
        if eye_contact_score < 50:
            improvements.append("Try to maintain more consistent eye contact with the camera")
        elif eye_contact_score < 70:
            improvements.append("Good eye contact, but try to be more consistent throughout the interview")
        
        # Posture feedback
        if posture_score < 50:
            improvements.append("Sit up straight and position yourself in the center of the frame")
        elif posture_score < 70:
            improvements.append("Good posture overall, but try to maintain a more centered position")
        
        # Overall feedback
        if confidence_score >= 85:
            overall = "Excellent interview presence! You demonstrate strong confidence and professionalism."
        elif confidence_score >= 70:
            overall = "Good interview presence with room for minor improvements."
        elif confidence_score >= 50:
            overall = "Your interview presence is developing. Focus on the suggested improvements."
        else:
            overall = "There's significant room for improvement in your interview presence. Practice the suggested techniques."
        
        # Add general tips
        if not improvements:
            improvements.append("Great job! Continue practicing to maintain these good habits.")
        else:
            improvements.extend([
                "Practice in front of a mirror to build confidence",
                "Record yourself answering common interview questions",
                "Maintain a slight smile and positive facial expression"
            ])
        
        return {
            "overall": overall,
            "improvements": improvements
        }
