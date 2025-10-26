from sqlalchemy.orm import Session
from database import User, InterviewSession, BehavioralAnalysis
from typing import Optional, Dict, Any
from datetime import datetime

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_google_id(self, google_id: str) -> Optional[User]:
        """Get user by Google ID"""
        return self.db.query(User).filter(User.google_id == google_id).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def create_user(self, user_data: Dict[str, Any]) -> User:
        """Create a new user"""
        user = User(
            google_id=user_data["google_id"],
            email=user_data["email"],
            name=user_data["name"],
            picture=user_data.get("picture"),
            verified_email=user_data.get("verified_email", False)
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update_user(self, user: User, user_data: Dict[str, Any]) -> User:
        """Update user information"""
        user.name = user_data.get("name", user.name)
        user.picture = user_data.get("picture", user.picture)
        user.verified_email = user_data.get("verified_email", user.verified_email)
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_or_create_user(self, user_data: Dict[str, Any]) -> User:
        """Get existing user or create new one"""
        user = self.get_user_by_google_id(user_data["google_id"])
        if user:
            # Update user data
            return self.update_user(user, user_data)
        else:
            # Create new user
            return self.create_user(user_data)
    
    def create_interview_session(self, user_id: int, session_data: Dict[str, Any]) -> InterviewSession:
        """Create a new interview session"""
        session = InterviewSession(
            user_id=user_id,
            company=session_data["company"],
            position=session_data["position"],
            interview_type=session_data["interview_type"],
            questions=session_data.get("questions", "[]")
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session
    
    def get_user_interview_sessions(self, user_id: int) -> list[InterviewSession]:
        """Get all interview sessions for a user"""
        return self.db.query(InterviewSession).filter(InterviewSession.user_id == user_id).all()
    
    def create_behavioral_analysis(self, user_id: int, analysis_data: Dict[str, Any]) -> BehavioralAnalysis:
        """Create a new behavioral analysis record"""
        analysis = BehavioralAnalysis(
            user_id=user_id,
            session_id=analysis_data.get("session_id"),
            confidence_score=analysis_data["confidence_score"],
            eye_contact_score=analysis_data["eye_contact_score"],
            posture_score=analysis_data["posture_score"],
            speech_clarity=analysis_data["speech_clarity"],
            overall_feedback=analysis_data["overall_feedback"],
            improvements=analysis_data.get("improvements", "[]")
        )
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        return analysis
    
    def get_user_behavioral_analyses(self, user_id: int) -> list[BehavioralAnalysis]:
        """Get all behavioral analyses for a user"""
        return self.db.query(BehavioralAnalysis).filter(BehavioralAnalysis.user_id == user_id).all()
