"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, MessageSquare, Video, BarChart3, Sparkles, TrendingUp, Calendar } from "lucide-react"
import { useProgressStore } from "@/lib/store/progress-store"
type Interview = { id: string; company: string; position: string; type: "technical"|"behavioral"|"system-design"|"coding"|"phone-screen"; date: string }

export default function DashboardPage() {
  const {
    getTotalQuestions,
    getSuccessRate,
    getStudyStreak,
    getTotalHours,
    interviewAttempts,
    dsaAttempts,
    mentorSessions,
    studySessions,
  } = useProgressStore()

  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([])
  const [mounted, setMounted] = useState(false)
  const [serverStats, setServerStats] = useState<null | { total_interviews: number; success_rate: number; study_hours: number; }>(null)

  // Fix hydration by only rendering client-dependent values after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("mentorverse_interviews")
    if (stored) {
      const interviews = JSON.parse(stored)
      setUpcomingInterviews(interviews)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (res.ok) {
          const s = await res.json()
          setServerStats(s)
        }
      } catch {}
    })()
  }, [])

  // Calculate values only after mounted to prevent hydration errors
  const totalQuestions = mounted ? getTotalQuestions() : 0
  const successRate = mounted ? (serverStats?.success_rate ?? getSuccessRate()) : 0
  const studyStreak = mounted ? getStudyStreak() : 0
  const totalHours = mounted ? (serverStats?.study_hours ?? getTotalHours()) : 0
  const totalInterviews = mounted ? (serverStats?.total_interviews ?? interviewAttempts.length) : 0

  const recentActivity = [
    ...dsaAttempts.slice(-5).map((a) => ({
      type: "dsa" as const,
      title: `${a.topic} - ${a.difficulty}`,
      subtitle: `DSA Practice • ${a.company}`,
      time: new Date(a.attemptedAt),
link: "/interview-assistant",
    })),
    ...studySessions.slice(-5).map((s) => ({
      type: "study" as const,
      title: s.topic,
      subtitle: `Study Practice • ${s.questionsCorrect}/${s.questionsAttempted} correct`,
      time: new Date(s.completedAt),
link: "/study",
    })),
    ...mentorSessions.slice(-5).map((m) => ({
      type: "mentor" as const,
      title: m.topic,
      subtitle: `AI Mentor Chat • ${m.messageCount} messages`,
      time: new Date(m.startedAt),
      link: "/dashboard/mentor",
    })),
    ...interviewAttempts.slice(-5).map((i) => ({
      type: "interview" as const,
      title: `${i.type} Interview`,
      subtitle: `Mock Interview • Score: ${i.score}%`,
      time: new Date(i.completedAt),
link: "/mock-interviews",
    })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 3)

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
  }

  const avgScore =
    totalInterviews > 0 ? Math.round(interviewAttempts.reduce((sum, i) => sum + i.score, 0) / totalInterviews) : 0

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Welcome Back!</h1>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">Ready to continue your learning journey?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Sparkles className="h-4 w-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studyStreak} day{studyStreak !== 1 ? "s" : ""}
            </div>
            <p className="text-xs text-muted-foreground">
              {studyStreak > 0 ? "Keep it up!" : "Start your streak today!"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Solved</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              {successRate > 0 ? `${successRate}% success rate` : "Start practicing!"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mock Interviews</CardTitle>
            <Video className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInterviews}</div>
            <p className="text-xs text-muted-foreground">
              {avgScore > 0 ? `Avg score: ${avgScore}%` : "Take your first interview!"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}h</div>
            <p className="text-xs text-muted-foreground">
              {totalHours > 0 ? "Great progress!" : "Start learning today!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {upcomingInterviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Upcoming Interviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {upcomingInterviews.slice(0, 2).map((interview) => (
              <Card key={interview.id} className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{interview.company}</CardTitle>
                  </div>
                  <CardDescription>{interview.position}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {new Date(interview.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
<Link href="/interview-assistant">Prepare Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Study Practice</CardTitle>
              <CardDescription>Practice data structures, algorithms, and system design</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
<Link href="/study">Start Practicing</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-2 group-hover:bg-secondary/20 transition-colors">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-lg">AI Mentor</CardTitle>
              <CardDescription>Get instant help and explanations from your AI mentor</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
<Link href="/interview-assistant">Chat with Mentor</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2 group-hover:bg-accent/20 transition-colors">
                <Video className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-lg">Mock Interview</CardTitle>
              <CardDescription>Practice technical interviews with AI feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
<Link href="/mock-interviews">Start Interview</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center mb-2 group-hover:bg-chart-4/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-chart-4" />
              </div>
              <CardTitle className="text-lg">View Progress</CardTitle>
              <CardDescription>Track your learning journey and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
<Link href="/analytics">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Recent Activity</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Continue Where You Left Off</CardTitle>
              <CardDescription className="text-sm">Pick up from your last session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                      {activity.type === "study" && <BookOpen className="h-5 w-5 text-primary" />}
                      {activity.type === "mentor" && <MessageSquare className="h-5 w-5 text-secondary" />}
                      {activity.type === "interview" && <Video className="h-5 w-5 text-accent" />}
                      {activity.type === "dsa" && <BookOpen className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate">{activity.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {activity.subtitle} • {getTimeAgo(activity.time)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="w-full sm:w-auto">
                    <Link href={activity.link}>Continue</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {recentActivity.length === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Get Started</h2>
          <Card>
            <CardContent className="py-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2 px-4">
                <p className="font-medium text-sm sm:text-base">Start Your Learning Journey</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Begin with study practice or chat with your AI mentor to get personalized guidance
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center px-4 w-full sm:w-auto">
                <Button asChild>
<Link href="/study">Start Practicing</Link>
                </Button>
                <Button asChild variant="outline">
<Link href="/interview-assistant">Chat with Mentor</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
