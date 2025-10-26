from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./interview_practice.db")

# Create engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class
Base = declarative_base()

# User model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    picture = Column(String)
    verified_email = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

# Legacy Interview session model (kept for compatibility)
class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    company = Column(String, nullable=False)
    position = Column(String, nullable=False)
    interview_type = Column(String, nullable=False)
    questions = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    is_completed = Column(Boolean, default=False)

# Behavioral analysis model
class BehavioralAnalysis(Base):
    __tablename__ = "behavioral_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    session_id = Column(Integer, nullable=True)
    confidence_score = Column(Integer, nullable=False)
    eye_contact_score = Column(Integer, nullable=False)
    posture_score = Column(Integer, nullable=False)
    speech_clarity = Column(Integer, nullable=False)
    overall_feedback = Column(Text)
    improvements = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

# New: granular progress tracking tables
class InterviewAttempt(Base):
    __tablename__ = "interview_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    type = Column(String, nullable=False)  # quick | full | behavioral | system-design
    difficulty = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    duration_sec = Column(Integer, nullable=False)
    questions = Column(Text)  # JSON array with correctness
    completed_at = Column(DateTime, default=datetime.utcnow, index=True)

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    topic = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    questions_attempted = Column(Integer, default=0)
    questions_correct = Column(Integer, default=0)
    duration_min = Column(Float, default=0.0)
    completed_at = Column(DateTime, default=datetime.utcnow, index=True)

class DSAAttempt(Base):
    __tablename__ = "dsa_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    company = Column(String, nullable=True)
    position = Column(String, nullable=True)
    topic = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    correct = Column(Boolean, default=False)
    attempted_at = Column(DateTime, default=datetime.utcnow, index=True)

class MentorSession(Base):
    __tablename__ = "mentor_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    topic = Column(String, nullable=False)
    message_count = Column(Integer, default=0)
    duration_min = Column(Float, default=0.0)
    started_at = Column(DateTime, default=datetime.utcnow, index=True)

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
