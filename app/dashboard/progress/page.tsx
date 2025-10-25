"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Award, Target, Calendar, Clock, Brain, Zap } from "lucide-react"
import { ProgressChart } from "@/components/progress/progress-chart"
import { ActivityHeatmap } from "@/components/progress/activity-heatmap"
import { useProgressStore } from "@/lib/store/progress-store"
import { useMemo } from "react"

export default function ProgressPage() {
  const {
    getTotalQuestions,
    getSuccessRate,
    getStudyStreak,
    getTotalHours,
    getTopicProgress,
    getInterviewStatsByDifficulty,
    getDSAStatsByDifficulty,
    interviewAttempts,
    dsaAttempts,
    studySessions,
  } = useProgressStore()

  const totalQuestions = getTotalQuestions()
  const successRate = getSuccessRate()
  const studyStreak = getStudyStreak()
  const totalHours = getTotalHours()
  const topicProgress = getTopicProgress()
  const interviewStats = getInterviewStatsByDifficulty()
  const dsaStats = getDSAStatsByDifficulty()

  // Calculate weekly activity
  const weeklyActivity = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1) // Start from Monday

    return days.map((day, index) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + index)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)

      const dayDSA = dsaAttempts.filter((a) => {
        const attemptDate = new Date(a.attemptedAt)
        return attemptDate >= date && attemptDate < nextDay
      })

      const dayStudy = studySessions.filter((s) => {
        const sessionDate = new Date(s.completedAt)
        return sessionDate >= date && sessionDate < nextDay
      })

      const questions = dayDSA.length + dayStudy.reduce((sum, s) => sum + s.questionsAttempted, 0)
      const hours = dayDSA.length * 0.25 + dayStudy.reduce((sum, s) => sum + s.duration / 60, 0)

      return { day, questions, hours: Math.round(hours * 10) / 10 }
    })
  }, [dsaAttempts, studySessions])

  const recentAchievements = [
    { title: "Week Warrior", description: `${studyStreak}-day study streak`, icon: Award, color: "text-chart-5" },
    {
      title: "Quick Learner",
      description: `Completed ${totalQuestions} questions`,
      icon: Zap,
      color: "text-primary",
    },
    {
      title: "Interview Ready",
      description: `${interviewAttempts.length} mock interviews`,
      icon: Brain,
      color: "text-secondary",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Progress Tracker</h1>
        <p className="text-lg text-muted-foreground">Track your learning journey and achievements</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">Across all modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">Overall accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Award className="h-4 w-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyStreak} days</div>
            <p className="text-xs text-muted-foreground">{studyStreak > 0 ? "Keep it up!" : "Start today!"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Studied</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}</div>
            <p className="text-xs text-muted-foreground">Total time invested</p>
          </CardContent>
        </Card>
      </div>

      {/* Mock Interview Stats by Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle>Mock Interview Performance</CardTitle>
          <CardDescription>Your performance across different difficulty levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(["easy", "medium", "hard"] as const).map((level) => {
            const stats = interviewStats[level]
            const percentage = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0

            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none capitalize">{level} Interviews</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.passed} passed of {stats.total} attempted
                    </p>
                  </div>
                  <Badge variant="secondary">{percentage}%</Badge>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
          {interviewAttempts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No mock interviews completed yet. Start practicing!
            </p>
          )}
        </CardContent>
      </Card>

      {/* DSA Practice Stats by Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle>DSA Practice Performance</CardTitle>
          <CardDescription>Your accuracy across different difficulty levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(["easy", "medium", "hard"] as const).map((level) => {
            const stats = dsaStats[level]
            const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0

            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none capitalize">{level} Questions</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.correct} correct of {stats.total} attempted
                    </p>
                  </div>
                  <Badge variant="secondary">{percentage}%</Badge>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
          {dsaAttempts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No DSA questions attempted yet. Start practicing!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Topic Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Mastery</CardTitle>
          <CardDescription>Your progress across different computer science topics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {topicProgress.map((topic) => (
            <div key={topic.topic} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{topic.topic}</p>
                  <p className="text-xs text-muted-foreground">
                    {topic.completed} of {topic.total} questions completed
                  </p>
                </div>
                <Badge variant="secondary">{topic.percentage}%</Badge>
              </div>
              <Progress value={topic.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Questions solved and study hours this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressChart data={weeklyActivity} />
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Study Activity</CardTitle>
              <CardDescription>Your study consistency over the past 12 weeks</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap />
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
          <CardDescription>Milestones you've unlocked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {recentAchievements.map((achievement) => (
              <Card key={achievement.title} className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center flex-shrink-0">
                      <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Study Recommendations */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {totalQuestions === 0 ? (
            <p className="text-sm text-muted-foreground">
              Start your learning journey! Try the Study Practice module or chat with the AI Mentor.
            </p>
          ) : (
            <>
              {topicProgress
                .filter((t) => t.percentage < 50)
                .slice(0, 2)
                .map((topic, index) => (
                  <div key={topic.topic} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Focus on {topic.topic} - you're at {topic.percentage}% completion. Try 2-3 questions this week to
                      improve.
                    </p>
                  </div>
                ))}
              {studyStreak > 0 && (
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">★</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You're on a {studyStreak}-day streak! Keep it up to unlock the "Consistency Champion" badge.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
