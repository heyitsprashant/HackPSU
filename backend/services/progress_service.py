from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import InterviewAttempt, StudySession, DSAAttempt, MentorSession

@dataclass
class DashboardStats:
    total_interviews: int
    completed_sessions: int
    success_rate: float
    average_score: float
    study_hours: float
    questions_practiced: int

class ProgressService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def stats(self) -> DashboardStats:
        total_interviews = self.db.query(InterviewAttempt).filter(InterviewAttempt.user_id == self.user_id).count()
        avg_score = (
            self.db.query(func.avg(InterviewAttempt.score))
            .filter(InterviewAttempt.user_id == self.user_id)
            .scalar()
            or 0.0
        )
        avg_score = float(avg_score)

        study_hours = (
            self.db.query(func.coalesce(func.sum(StudySession.duration_min), 0.0))
            .filter(StudySession.user_id == self.user_id)
            .scalar()
            or 0.0
        )
        mentor_hours = (
            self.db.query(func.coalesce(func.sum(MentorSession.duration_min), 0.0))
            .filter(MentorSession.user_id == self.user_id)
            .scalar()
            or 0.0
        )
        interview_hours = (
            self.db.query(func.coalesce(func.sum(InterviewAttempt.duration_sec), 0))
            .filter(InterviewAttempt.user_id == self.user_id)
            .scalar()
            or 0
        )
        interview_hours = interview_hours / 60.0

        questions_practiced = (
            (self.db.query(func.coalesce(func.sum(StudySession.questions_attempted), 0)).filter(StudySession.user_id == self.user_id).scalar() or 0)
            + (self.db.query(func.count(DSAAttempt.id)).filter(DSAAttempt.user_id == self.user_id).scalar() or 0)
        )

        dsa_correct = (
            self.db.query(func.count(DSAAttempt.id))
            .filter(DSAAttempt.user_id == self.user_id, DSAAttempt.correct == True)
            .scalar()
            or 0
        )
        dsa_total = self.db.query(func.count(DSAAttempt.id)).filter(DSAAttempt.user_id == self.user_id).scalar() or 0
        study_correct = (
            self.db.query(func.coalesce(func.sum(StudySession.questions_correct), 0))
            .filter(StudySession.user_id == self.user_id)
            .scalar()
            or 0
        )
        study_total = (
            self.db.query(func.coalesce(func.sum(StudySession.questions_attempted), 0))
            .filter(StudySession.user_id == self.user_id)
            .scalar()
            or 0
        )
        success_rate = 0.0
        total_attempts = dsa_total + study_total
        total_correct = dsa_correct + study_correct
        if total_attempts > 0:
            success_rate = (total_correct / total_attempts) * 100.0

        return DashboardStats(
            total_interviews=total_interviews,
            completed_sessions=(self.db.query(func.count(StudySession.id)).filter(StudySession.user_id == self.user_id).scalar() or 0),
            success_rate=round(success_rate, 1),
            average_score=round(avg_score, 1),
            study_hours=round(float(study_hours + mentor_hours + interview_hours), 1),
            questions_practiced=int(questions_practiced),
        )

    def weekly_progress(self) -> List[Dict[str, Any]]:
        now = datetime.utcnow()
        start = now - timedelta(weeks=8)
        rows = (
            self.db.query(
                func.strftime('%Y-%W', StudySession.completed_at).label('yw'),
                func.coalesce(func.sum(StudySession.questions_attempted), 0),
                func.coalesce(func.avg(StudySession.questions_correct * 100.0 / func.nullif(StudySession.questions_attempted, 0)), 0.0),
            )
            .filter(StudySession.user_id == self.user_id, StudySession.completed_at >= start)
            .group_by('yw')
            .order_by('yw')
            .all()
        )
        data = []
        for yw, qsum, avgpct in rows:
            week_label = f"{yw.split('-')[0]} W{yw.split('-')[1]}"
            data.append({"week": week_label, "sessions": int(qsum) // 10 if qsum else 0, "score": round(float(avgpct or 0), 1)})
        if not data:
            for i in range(8):
                week_date = now - timedelta(weeks=7-i)
                week_label = f"{week_date.year} W{week_date.isocalendar()[1]}"
                data.append({"week": week_label, "sessions": 0, "score": 0})
        return data

    def category_performance(self) -> List[Dict[str, Any]]:
        rows = (
            self.db.query(
                StudySession.topic,
                func.coalesce(func.sum(StudySession.questions_attempted), 0).label('q'),
                func.coalesce(func.sum(StudySession.questions_correct), 0).label('c'),
            )
            .filter(StudySession.user_id == self.user_id)
            .group_by(StudySession.topic)
            .all()
        )
        data = []
        for topic, q, c in rows:
            pct = round((c / q) * 100, 1) if q else 0.0
            data.append({"category": topic, "questions": int(q), "correct": int(c), "percentage": pct})
        if not data:
            data = [
                {"category": "Technical", "questions": 0, "correct": 0, "percentage": 0},
                {"category": "Behavioral", "questions": 0, "correct": 0, "percentage": 0},
                {"category": "System Design", "questions": 0, "correct": 0, "percentage": 0},
            ]
        return data

    def recent_activity(self) -> List[Dict[str, Any]]:
        def map_row(date: datetime, label: str, score: float):
            return {"date": date.strftime('%Y-%m-%d'), "activity": label, "score": round(score, 1)}
        acts = []
        for r in self.db.query(StudySession).filter(StudySession.user_id == self.user_id).order_by(StudySession.completed_at.desc()).limit(5).all():
            score = (r.questions_correct * 100.0 / r.questions_attempted) if r.questions_attempted else 0
            acts.append(map_row(r.completed_at, f"Study: {r.topic}", score))
        for r in self.db.query(InterviewAttempt).filter(InterviewAttempt.user_id == self.user_id).order_by(InterviewAttempt.completed_at.desc()).limit(5).all():
            acts.append(map_row(r.completed_at, f"Interview: {r.type}", r.score))
        for r in self.db.query(DSAAttempt).filter(DSAAttempt.user_id == self.user_id).order_by(DSAAttempt.attempted_at.desc()).limit(5).all():
            acts.append(map_row(r.attempted_at, f"DSA: {r.topic}", 100.0 if r.correct else 0.0))
        acts.sort(key=lambda a: a["date"], reverse=True)
        result = acts[:5]
        if not result:
            now = datetime.utcnow()
            result = [{"date": now.strftime('%Y-%m-%d'), "activity": "No activity yet", "score": 0}]
        return result
