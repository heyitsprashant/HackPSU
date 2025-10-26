"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, MessageSquare, Clock } from "lucide-react"
import { useEffect, useState } from "react"

export function PracticeStats() {
  const [stats, setStats] = useState<{ completed_sessions: number; questions_practiced: number; success_rate: number } | null>(null)
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (res.ok) setStats(await res.json())
      } catch {}
    })()
  }, [])

  const sessions = stats?.completed_sessions ?? 0
  const questions = stats?.questions_practiced ?? 0
  const accuracy = Math.max(0, Math.min(100, Math.round(stats?.success_rate ?? 0)))

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="rounded-xl shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                <p className="text-xl font-bold">{sessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm bg-gradient-to-br from-secondary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-secondary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Questions</p>
                <p className="text-xl font-bold">{questions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm bg-gradient-to-br from-accent/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                <p className="text-xl font-bold">{accuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar (backend-driven as accuracy) */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Overall Accuracy</h4>
              <Badge variant="secondary" className="rounded-full">{accuracy}%</Badge>
            </div>
            <Progress value={accuracy} className="h-2" />
            <p className="text-xs text-muted-foreground">Backend-calculated success rate across activities.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
