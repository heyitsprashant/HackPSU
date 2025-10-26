import { create } from "zustand"
import { persist } from "zustand/middleware"

export type DifficultyLevel = "easy" | "medium" | "hard"

export type InterviewAttempt = {
  id: string
  type: "quick" | "full" | "behavioral" | "system-design"
  difficulty: DifficultyLevel
  score: number
  duration: number
  completedAt: Date
  questions: {
    question: string
    correct: boolean
  }[]
}

export type DSAAttempt = {
  id: string
  company: string
  position: string
  difficulty: DifficultyLevel
  question: string
  topic: string
  correct: boolean
  attemptedAt: Date
}

export type MentorSession = {
  id: string
  topic: string
  messageCount: number
  duration: number
  startedAt: Date
}

export type StudySession = {
  id: string
  topic: string
  difficulty: DifficultyLevel
  questionsAttempted: number
  questionsCorrect: number
  duration: number
  completedAt: Date
}

type ProgressState = {
  // Interview tracking
  interviewAttempts: InterviewAttempt[]
  addInterviewAttempt: (attempt: Omit<InterviewAttempt, "id" | "completedAt">) => void

  // DSA practice tracking
  dsaAttempts: DSAAttempt[]
  addDSAAttempt: (attempt: Omit<DSAAttempt, "id" | "attemptedAt">) => void

  // AI Mentor tracking
  mentorSessions: MentorSession[]
  addMentorSession: (session: Omit<MentorSession, "id">) => void
  updateMentorSession: (id: string, updates: Partial<MentorSession>) => void

  // Study practice tracking
  studySessions: StudySession[]
  addStudySession: (session: Omit<StudySession, "id" | "completedAt">) => void

  // Computed stats
  getTotalQuestions: () => number
  getSuccessRate: () => number
  getStudyStreak: () => number
  getTotalHours: () => number
  getTopicProgress: () => {
    topic: string
    completed: number
    total: number
    percentage: number
  }[]
  getInterviewStatsByDifficulty: () => {
    easy: { total: number; passed: number }
    medium: { total: number; passed: number }
    hard: { total: number; passed: number }
  }
  getDSAStatsByDifficulty: () => {
    easy: { total: number; correct: number }
    medium: { total: number; correct: number }
    hard: { total: number; correct: number }
  }
}

function userIdHeader() {
  if (typeof window === 'undefined') return {}
  try {
    const u = localStorage.getItem('auth_user')
    if (!u) return {}
    const parsed = JSON.parse(u)
    return { 'x-user-id': String(parsed.id || 1) }
  } catch { return {} }
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      interviewAttempts: [],
      dsaAttempts: [],
      mentorSessions: [],
      studySessions: [],

      addInterviewAttempt: (attempt) =>
        set((state) => {
          const record = {
            ...attempt,
            id: crypto.randomUUID(),
            completedAt: new Date(),
          }
          // fire-and-forget persistence to backend
          try {
            fetch('/api/progress/interview', {
              method: 'POST',
headers: { 'Content-Type': 'application/json', ...userIdHeader() },
              body: JSON.stringify({
                type: record.type,
                difficulty: record.difficulty,
                score: record.score,
                duration: record.duration,
                questions: record.questions,
              }),
            }).catch(() => {})
          } catch {}
          return {
            interviewAttempts: [
              ...state.interviewAttempts,
              record,
            ],
          }
        }),

      addDSAAttempt: (attempt) =>
        set((state) => {
          const record = {
            ...attempt,
            id: crypto.randomUUID(),
            attemptedAt: new Date(),
          }
          try {
            fetch('/api/progress/dsa', {
              method: 'POST',
headers: { 'Content-Type': 'application/json', ...userIdHeader() },
              body: JSON.stringify({
                company: record.company,
                position: record.position,
                topic: record.topic,
                difficulty: record.difficulty,
                correct: record.correct,
              }),
            }).catch(() => {})
          } catch {}
          return {
            dsaAttempts: [
              ...state.dsaAttempts,
              record,
            ],
          }
        }),

      addMentorSession: (session) =>
        set((state) => {
          const record = { ...session, id: crypto.randomUUID() }
          try {
            fetch('/api/progress/mentor', {
              method: 'POST',
headers: { 'Content-Type': 'application/json', ...userIdHeader() },
              body: JSON.stringify({
                topic: record.topic,
                messageCount: record.messageCount,
                durationMin: record.duration / 60,
              }),
            }).catch(() => {})
          } catch {}
          return {
            mentorSessions: [
              ...state.mentorSessions,
              record,
            ],
          }
        }),

      updateMentorSession: (id, updates) =>
        set((state) => ({
          mentorSessions: state.mentorSessions.map((session) =>
            session.id === id ? { ...session, ...updates } : session,
          ),
        })),

      addStudySession: (session) =>
        set((state) => {
          const record = { ...session, id: crypto.randomUUID(), completedAt: new Date() }
          try {
            fetch('/api/progress/study', {
              method: 'POST',
headers: { 'Content-Type': 'application/json', ...userIdHeader() },
              body: JSON.stringify({
                topic: record.topic,
                difficulty: record.difficulty,
                questionsAttempted: record.questionsAttempted,
                questionsCorrect: record.questionsCorrect,
                durationMin: record.duration / 60,
              }),
            }).catch(() => {})
          } catch {}
          return {
            studySessions: [
              ...state.studySessions,
              record,
            ],
          }
        }),

      getTotalQuestions: () => {
        const state = get()
        const dsaCount = state.dsaAttempts.length
        const studyCount = state.studySessions.reduce((sum, s) => sum + s.questionsAttempted, 0)
        const interviewCount = state.interviewAttempts.reduce((sum, i) => sum + i.questions.length, 0)
        return dsaCount + studyCount + interviewCount
      },

      getSuccessRate: () => {
        const state = get()
        const dsaCorrect = state.dsaAttempts.filter((a) => a.correct).length
        const dsaTotal = state.dsaAttempts.length

        const studyCorrect = state.studySessions.reduce((sum, s) => sum + s.questionsCorrect, 0)
        const studyTotal = state.studySessions.reduce((sum, s) => sum + s.questionsAttempted, 0)

        const interviewCorrect = state.interviewAttempts.reduce(
          (sum, i) => sum + i.questions.filter((q) => q.correct).length,
          0,
        )
        const interviewTotal = state.interviewAttempts.reduce((sum, i) => sum + i.questions.length, 0)

        const totalCorrect = dsaCorrect + studyCorrect + interviewCorrect
        const totalAttempts = dsaTotal + studyTotal + interviewTotal

        return totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
      },

      getStudyStreak: () => {
        const state = get()
        const allDates = [
          ...state.dsaAttempts.map((a) => new Date(a.attemptedAt)),
          ...state.studySessions.map((s) => new Date(s.completedAt)),
          ...state.interviewAttempts.map((i) => new Date(i.completedAt)),
          ...state.mentorSessions.map((m) => new Date(m.startedAt)),
        ].sort((a, b) => b.getTime() - a.getTime())

        if (allDates.length === 0) return 0

        let streak = 0
        let currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0)

        for (const date of allDates) {
          const activityDate = new Date(date)
          activityDate.setHours(0, 0, 0, 0)

          const diffDays = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays === streak) {
            streak++
            currentDate = activityDate
          } else if (diffDays > streak) {
            break
          }
        }

        return streak
      },

      getTotalHours: () => {
        const state = get()
        const dsaHours = state.dsaAttempts.length * 0.25 // ~15 min per question
        const studyHours = state.studySessions.reduce((sum, s) => sum + s.duration / 60, 0)
        const interviewHours = state.interviewAttempts.reduce((sum, i) => sum + i.duration / 60, 0)
        const mentorHours = state.mentorSessions.reduce((sum, m) => sum + m.duration / 60, 0)

        return Math.round((dsaHours + studyHours + interviewHours + mentorHours) * 10) / 10
      },

      getTopicProgress: () => {
        const state = get()
        const topics = ["Data Structures", "Algorithms", "System Design", "OOP Concepts", "Databases", "Networks"]

        return topics.map((topic) => {
          const dsaForTopic = state.dsaAttempts.filter((a) => a.topic === topic)
          const studyForTopic = state.studySessions.filter((s) => s.topic === topic)

          const completed =
            dsaForTopic.filter((a) => a.correct).length + studyForTopic.reduce((sum, s) => sum + s.questionsCorrect, 0)
          const total = dsaForTopic.length + studyForTopic.reduce((sum, s) => sum + s.questionsAttempted, 0)

          return {
            topic,
            completed,
            total: Math.max(total, 30), // Minimum 30 questions per topic
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
          }
        })
      },

      getInterviewStatsByDifficulty: () => {
        const state = get()
        const stats = {
          easy: { total: 0, passed: 0 },
          medium: { total: 0, passed: 0 },
          hard: { total: 0, passed: 0 },
        }

        state.interviewAttempts.forEach((attempt) => {
          stats[attempt.difficulty].total++
          if (attempt.score >= 70) {
            stats[attempt.difficulty].passed++
          }
        })

        return stats
      },

      getDSAStatsByDifficulty: () => {
        const state = get()
        const stats = {
          easy: { total: 0, correct: 0 },
          medium: { total: 0, correct: 0 },
          hard: { total: 0, correct: 0 },
        }

        state.dsaAttempts.forEach((attempt) => {
          stats[attempt.difficulty].total++
          if (attempt.correct) {
            stats[attempt.difficulty].correct++
          }
        })

        return stats
      },
    }),
    {
      name: "mentorverse-progress",
    },
  ),
)
