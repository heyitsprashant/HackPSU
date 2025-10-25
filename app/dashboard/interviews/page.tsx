"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Code, MessageSquare, Brain } from "lucide-react"
import { InterviewSession } from "@/components/interview/interview-session"
import { useProgressStore } from "@/lib/store/progress-store"

type InterviewType = "quick" | "full" | "behavioral" | "system-design"

export default function InterviewsPage() {
  const [activeInterview, setActiveInterview] = useState<InterviewType | null>(null)

  const { interviewAttempts, getInterviewStatsByDifficulty } = useProgressStore()
  const interviewStats = getInterviewStatsByDifficulty()

  const totalInterviews = interviewAttempts.length
  const avgScore =
    totalInterviews > 0 ? Math.round(interviewAttempts.reduce((sum, i) => sum + i.score, 0) / totalInterviews) : 0
  const totalTime = Math.round(interviewAttempts.reduce((sum, i) => sum + i.duration / 60, 0) * 10) / 10

  if (activeInterview) {
    return <InterviewSession type={activeInterview} onEnd={() => setActiveInterview(null)} />
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Mock Interviews</h1>
        <p className="text-lg text-muted-foreground">Practice technical interviews with AI-powered feedback</p>
      </div>

      {/* Interview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Interviews Completed</p>
              <p className="text-3xl font-bold">{totalInterviews}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-3xl font-bold">{avgScore}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Practice Time</p>
              <p className="text-3xl font-bold">{totalTime}h</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview Types */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Choose Interview Type</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Quick Coding Interview</CardTitle>
              <CardDescription>30-minute focused coding challenge with 2-3 problems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">30 min</Badge>
                <Badge variant="secondary">2-3 Problems</Badge>
                <Badge variant="secondary">Easy-Medium</Badge>
              </div>
              <Button className="w-full" onClick={() => setActiveInterview("quick")}>
                Start Quick Interview
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-2">
                <Code className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Full Technical Interview</CardTitle>
              <CardDescription>60-minute comprehensive coding interview simulation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">60 min</Badge>
                <Badge variant="secondary">3-4 Problems</Badge>
                <Badge variant="secondary">Medium-Hard</Badge>
              </div>
              <Button className="w-full" onClick={() => setActiveInterview("full")}>
                Start Full Interview
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Behavioral Interview</CardTitle>
              <CardDescription>Practice soft skills, communication, and STAR method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">45 min</Badge>
                <Badge variant="secondary">5-7 Questions</Badge>
                <Badge variant="secondary">STAR Method</Badge>
              </div>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setActiveInterview("behavioral")}
              >
                Start Behavioral
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>System Design Interview</CardTitle>
              <CardDescription>Design scalable systems and discuss architecture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">45 min</Badge>
                <Badge variant="secondary">1-2 Systems</Badge>
                <Badge variant="secondary">Architecture</Badge>
              </div>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setActiveInterview("system-design")}
              >
                Start System Design
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Interview Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Think out loud - explain your thought process as you solve problems
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ask clarifying questions before jumping into code
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Test your solution with examples and edge cases
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
