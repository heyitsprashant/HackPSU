import re
import json
from typing import Dict, Any, Optional
from bs4 import BeautifulSoup
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

class EmailParser:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            # Use Gemini 2.5 Computer for more powerful analysis
            self.model = genai.GenerativeModel('gemini-2.5-computer-use-preview-10-2025')
        else:
            self.model = None
        
    async def parse_email(self, content: str) -> Dict[str, Any]:
        """Parse email content to extract interview details"""
        
        # Clean HTML content
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text()
        
        # Extract basic information using regex patterns
        company = self._extract_company(text_content)
        position = self._extract_position(text_content)
        interview_type = self._extract_interview_type(text_content)
        date_time = self._extract_datetime(text_content)
        location = self._extract_location(text_content)
        
        # Use AI to extract additional details
        ai_extracted = await self._ai_extract_details(text_content)
        # Extract explicit questions from the email body
        explicit_questions = self._extract_questions(text_content)
        # Merge AI-detected questions if present
        ai_qs = ai_extracted.get("questions", []) if isinstance(ai_extracted, dict) else []
        merged_questions = list(dict.fromkeys([q.strip() for q in (explicit_questions + ai_qs) if q and isinstance(q, str)]))[:20]
        
        return {
            "company": company or ai_extracted.get("company"),
            "position": position or ai_extracted.get("position"),
            "interview_type": interview_type or ai_extracted.get("interview_type"),
            "date": date_time.get("date") if date_time else None,
            "time": date_time.get("time") if date_time else None,
            "location": location or ai_extracted.get("location"),
            "requirements": ai_extracted.get("requirements", []),
            "skills": ai_extracted.get("skills", []),
            "experience_level": ai_extracted.get("experience_level"),
            "additional_notes": ai_extracted.get("additional_notes", ""),
            "extracted_questions": merged_questions,
            "raw_content": text_content
        }
    
    def _extract_company(self, content: str) -> Optional[str]:
        """Extract company name from email content"""
        # Common patterns for company names
        patterns = [
            r"interview with\s+([A-Z][a-zA-Z\s&]+)",
            r"at\s+([A-Z][a-zA-Z\s&]+)\s+for",
            r"([A-Z][a-zA-Z\s&]+)\s+interview",
            r"position at\s+([A-Z][a-zA-Z\s&]+)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None
    
    def _extract_position(self, content: str) -> Optional[str]:
        """Extract job position from email content"""
        patterns = [
            r"for\s+([A-Z][a-zA-Z\s]+)\s+position",
            r"position\s+of\s+([A-Z][a-zA-Z\s]+)",
            r"([A-Z][a-zA-Z\s]+)\s+role",
            r"hiring\s+for\s+([A-Z][a-zA-Z\s]+)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None
    
    def _extract_interview_type(self, content: str) -> Optional[str]:
        """Extract interview type from email content"""
        content_lower = content.lower()
        
        if "phone" in content_lower or "telephone" in content_lower:
            return "Phone"
        elif "video" in content_lower or "zoom" in content_lower or "teams" in content_lower:
            return "Video"
        elif "onsite" in content_lower or "on-site" in content_lower:
            return "On-site"
        elif "technical" in content_lower:
            return "Technical"
        elif "behavioral" in content_lower:
            return "Behavioral"
        elif "panel" in content_lower:
            return "Panel"
        else:
            return "General"
    
    def _extract_datetime(self, content: str) -> Optional[Dict[str, str]]:
        """Extract date and time from email content"""
        # Date patterns
        date_patterns = [
            r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{2,4})",
            r"((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December))",
        ]
        
        # Time patterns
        time_patterns = [
            r"(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))",
            r"(\d{1,2}\s*(?:AM|PM|am|pm))",
        ]
        
        date_match = None
        time_match = None
        
        for pattern in date_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                date_match = match.group(1)
                break
        
        for pattern in time_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                time_match = match.group(1)
                break
        
        if date_match or time_match:
            return {"date": date_match, "time": time_match}
        return None
    
    def _extract_location(self, content: str) -> Optional[str]:
        """Extract location from email content"""
        patterns = [
            r"at\s+([A-Z][a-zA-Z\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Place|Pl|Court|Ct|Circle|Cir|Square|Sq|Parkway|Pkwy))",
            r"in\s+([A-Z][a-zA-Z\s,]+)",
            r"location:\s*([A-Z][a-zA-Z\s,]+)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content)
            if match:
                return match.group(1).strip()
        return None
    
    def _extract_questions(self, content: str) -> list:
        """Heuristically extract potential interview questions from the email body."""
        lines = [l.strip(" •-*\t>\u2022\u25CF").strip() for l in content.splitlines()]
        qs = []
        for ln in lines:
            if not ln:
                continue
            # Common indicators: question mark, bullets, enumerations
            if ln.endswith("?") and len(ln) >= 8:
                qs.append(ln)
                continue
            if re.match(r"^(Q\d*[:.)-]|\d+[.)-])\s+.+", ln, flags=re.IGNORECASE):
                txt = re.sub(r"^(Q\d*[:.)-]|\d+[.)-])\s+", "", ln).strip()
                if txt.endswith("?") or len(txt.split()) >= 5:
                    qs.append(txt)
        # Deduplicate while preserving order
        seen = set(); out = []
        for q in qs:
            if q not in seen:
                seen.add(q); out.append(q)
        return out[:20]
    
    async def _ai_extract_details(self, content: str) -> Dict[str, Any]:
        """Use AI to extract additional interview details"""
        if not self.model:
            # Fallback to basic extraction when no API key
            return {
                "company": None,
                "position": None,
                "interview_type": None,
                "location": None,
                "requirements": [],
                "skills": [],
                "experience_level": None,
                "additional_notes": "AI extraction requires Gemini API key"
            }
            
        try:
            prompt = f"""
            You are an expert HR and technical recruiter with deep knowledge of the tech industry. Analyze this interview invitation email with maximum precision and context awareness.

            Extract interview-related information with high accuracy. Pay special attention to:
            - Company culture and values mentioned
            - Specific technical requirements and preferred technologies
            - Interview format and process details
            - Experience level expectations
            - Any unique requirements or preferences

            Return a JSON object with this exact structure:
            {
                "company": "Company name (be precise, include full name if available)",
                "position": "Exact job title and level (e.g., Senior Software Engineer, not just 'Engineer')", 
                "interview_type": "Specific interview type (Technical, Behavioral, Phone, Video, On-site, Panel, etc.)",
                "location": "Interview location (office, remote, hybrid, etc.)",
                "requirements": ["Detailed list of technical requirements, frameworks, languages mentioned"],
                "skills": ["Specific technologies, tools, and skills explicitly mentioned"],
                "experience_level": "Experience level (Entry, Mid, Senior, Lead, Principal, etc.)",
                "additional_notes": "Any special requirements, company culture notes, or unique aspects",
                "questions": ["If the email lists or implies questions, enumerate them here as plain text"]
            }
            
            Email Content: {content[:3000]}
            
            Be extremely precise and extract every relevant detail. Return only valid JSON.
            """
            
            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            return result
            
        except Exception as e:
            print(f"AI extraction failed: {e}")
            return {
                "company": None,
                "position": None,
                "interview_type": None,
                "location": None,
                "requirements": [],
                "skills": [],
                "experience_level": None,
                "additional_notes": ""
            }
