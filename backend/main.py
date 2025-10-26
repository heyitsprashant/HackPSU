from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from services.email_parser import EmailParser
from services.interview_generator import InterviewGenerator
from services.behavioral_analyzer import BehavioralAnalyzer
from database import (
    create_tables,
    get_db,
    InterviewAttempt,
    StudySession,
    DSAAttempt,
    MentorSession,
    BehavioralAnalysis as BehavioralAnalysisModel,
)
from services.progress_service import ProgressService
from services.unified_interview import run_unified

load_dotenv()
create_tables()

DEFAULT_USER_ID = 1

app = FastAPI(title="Interview Practice API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

email_parser = EmailParser()
interview_generator = InterviewGenerator()
behavioral_analyzer = BehavioralAnalyzer()
class EmailContent(BaseModel):
    content: str

class InterviewQuestion(BaseModel):
    question: str
    category: str
    difficulty: str
    expected_answer: Optional[str] = None
    tips: List[str] = []

class GeneratedInterview(BaseModel):
    id: str
    company: str
    position: str
    interview_type: str
    categories: list
    created_at: str

class BehavioralAnalysis(BaseModel):
    confidence_score: float
    eye_contact_score: float
    posture_score: float
    speech_clarity: float
    overall_feedback: str
    improvements: List[str]

class BehavioralStart(BaseModel):
    placeholder: str | None = None

class BehavioralChunkPayload(BaseModel):
    session_id: str
    timestamp: float
    image_b64: str | None = None
    audio_b64: str | None = None
    transcript_segment: str | None = None

class BehavioralFinishPayload(BaseModel):
    session_id: str
    overall: BehavioralAnalysis
    trends: dict | None = None
    segments: List[dict] | None = None

class TrackInterviewAttempt(BaseModel):
    type: str
    difficulty: str
    score: int
    duration: int
    questions: List[dict]

class TrackStudySession(BaseModel):
    topic: str
    difficulty: str
    questionsAttempted: int
    questionsCorrect: int
    durationMin: float

class TrackDSAAttempt(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    topic: str
    difficulty: str
    correct: bool

class TrackMentorSession(BaseModel):
    topic: str
    messageCount: int
    durationMin: float

class UnifiedInterviewRequest(BaseModel):
    question: str
    answer: str
    mode: str | None = "text"  # 'text' | 'visual'
    voice: str | None = None


@app.get("/")
async def root():
    return {"message": "Interview Practice API is running!"}


@app.post("/parse-email")
async def parse_email(email: EmailContent):
    try:
        parsed_data = await email_parser.parse_email(email.content)
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/generate-interview")
async def generate_interview(parsed_data: dict, db: Session = Depends(get_db)):
    try:
        session_payload = await interview_generator.generate_interview(parsed_data)
        return session_payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-behavioral")
async def analyze_behavioral(video_file: UploadFile = File(...)):
    try:
        analysis = await behavioral_analyzer.analyze_video(video_file)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/behavioral/start")
async def behavioral_start(_: BehavioralStart):
    import uuid as _uuid
    return {"session_id": str(_uuid.uuid4())}

@app.post("/behavioral/chunk")
async def behavioral_chunk(payload: BehavioralChunkPayload):
    try:
        metrics = await behavioral_analyzer.analyze_chunk(payload.image_b64, payload.audio_b64, payload.transcript_segment)
        return {"session_id": payload.session_id, "timestamp": payload.timestamp, "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/behavioral/finish")
async def behavioral_finish(payload: BehavioralFinishPayload, user_id: int = Query(DEFAULT_USER_ID), db: Session = Depends(get_db)):
    try:
        from json import dumps as _dumps
        rec = BehavioralAnalysisModel(
            user_id=user_id,
            session_id=None,
            confidence_score=int(payload.overall.confidence_score),
            eye_contact_score=int(payload.overall.eye_contact_score),
            posture_score=int(payload.overall.posture_score),
            speech_clarity=int(payload.overall.speech_clarity),
            overall_feedback=payload.overall.overall_feedback,
            improvements=_dumps({
                "improvements": payload.overall.improvements,
                "trends": payload.trends or {},
                "segments": payload.segments or [],
            }),
        )
        db.add(rec)
        db.commit()
        return {"ok": True, "id": rec.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/tracking/interview")
async def track_interview(
    payload: TrackInterviewAttempt,
    user_id: int = Query(DEFAULT_USER_ID),
    db: Session = Depends(get_db),
):
    try:
        rec = InterviewAttempt(
            user_id=user_id,
            type=payload.type,
            difficulty=payload.difficulty,
            score=payload.score,
            duration_sec=payload.duration,
            questions=os.path.join('', '') or str(payload.questions),
        )
        # Serialize questions reliably
        import json as _json
        rec.questions = _json.dumps(payload.questions)
        db.add(rec)
        db.commit()
        return {"ok": True, "id": rec.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tracking/study")
async def track_study(
    payload: TrackStudySession,
    user_id: int = Query(DEFAULT_USER_ID),
    db: Session = Depends(get_db),
):
    try:
        rec = StudySession(
            user_id=user_id,
            topic=payload.topic,
            difficulty=payload.difficulty,
            questions_attempted=payload.questionsAttempted,
            questions_correct=payload.questionsCorrect,
            duration_min=payload.durationMin,
        )
        db.add(rec)
        db.commit()
        return {"ok": True, "id": rec.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tracking/dsa")
async def track_dsa(
    payload: TrackDSAAttempt,
    user_id: int = Query(DEFAULT_USER_ID),
    db: Session = Depends(get_db),
):
    try:
        rec = DSAAttempt(
            user_id=user_id,
            company=payload.company,
            position=payload.position,
            topic=payload.topic,
            difficulty=payload.difficulty,
            correct=payload.correct,
        )
        db.add(rec)
        db.commit()
        return {"ok": True, "id": rec.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tracking/mentor")
async def track_mentor(
    payload: TrackMentorSession,
    user_id: int = Query(DEFAULT_USER_ID),
    db: Session = Depends(get_db),
):
    try:
        rec = MentorSession(
            user_id=user_id,
            topic=payload.topic,
            message_count=payload.messageCount,
            duration_min=payload.durationMin,
        )
        db.add(rec)
        db.commit()
        return {"ok": True, "id": rec.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/stats")
async def get_dashboard_stats(
    user_id: int = Query(DEFAULT_USER_ID), db: Session = Depends(get_db)
):
    try:
        service = ProgressService(db, user_id)
        s = service.stats()
        return {
            "total_interviews": s.total_interviews,
            "completed_sessions": s.completed_sessions,
            "success_rate": s.success_rate,
            "average_score": s.average_score,
            "study_hours": s.study_hours,
            "questions_practiced": s.questions_practiced,
            "companies_applied": 0,
            "interviews_scheduled": 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/progress")
async def get_progress_data(
    user_id: int = Query(DEFAULT_USER_ID), db: Session = Depends(get_db)
):
    try:
        service = ProgressService(db, user_id)
        return service.weekly_progress()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/categories")
async def get_category_performance(
    user_id: int = Query(DEFAULT_USER_ID), db: Session = Depends(get_db)
):
    try:
        service = ProgressService(db, user_id)
        return service.category_performance()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/recent-activity")
async def get_recent_activity(
    user_id: int = Query(DEFAULT_USER_ID), db: Session = Depends(get_db)
):
    try:
        service = ProgressService(db, user_id)
        return service.recent_activity()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/behavioral")
async def get_behavioral_summaries(user_id: int = Query(DEFAULT_USER_ID), db: Session = Depends(get_db)):
    try:
        rows = (
            db.query(BehavioralAnalysisModel)
            .filter(BehavioralAnalysisModel.user_id == user_id)
            .order_by(BehavioralAnalysisModel.created_at.desc())
            .limit(5)
            .all()
        )
        import json as _json
        out = []
        for r in rows:
            trends = {}
            segments = []
            improvements = []
            try:
                blob = _json.loads(r.improvements or "{}")
                trends = blob.get("trends", {})
                segments = blob.get("segments", [])
                improvements = blob.get("improvements", [])
            except Exception:
                pass
            out.append({
                "id": r.id,
                "date": r.created_at.isoformat() if hasattr(r, 'created_at') and r.created_at else None,
                "confidence_score": r.confidence_score,
                "eye_contact_score": r.eye_contact_score,
                "posture_score": r.posture_score,
                "speech_clarity": r.speech_clarity,
                "overall_feedback": r.overall_feedback,
                "improvements": improvements,
                "trends": trends,
                "segments": segments,
            })
        return out
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/interview")
async def interview_endpoint(payload: UnifiedInterviewRequest):
    try:
        data = run_unified(payload.question, payload.answer, payload.mode or "text", payload.voice)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
