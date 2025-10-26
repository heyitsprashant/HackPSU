"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Code, MessageSquare, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { getUserStats, setUserStats, getSessions, pushSession, type Session } from "@/lib/localStore"
import { SummaryTiles } from "@/components/SummaryTiles"
import { PastSessionsDrawer } from "@/components/PastSessionsDrawer"
import { InterviewModeCard } from "@/components/InterviewModeCard"
import { BackButton } from "@/components/ui/back-button"

export default function MockInterviewsPage() {
  const stats = getUserStats()
  const [drawerMode, setDrawerMode] = useState<"quick"|"full"|"behavioral"|"system"|null>(null)
  const router = useRouter()

  const tiles = {
    completed: stats.completed,
    avgScore: stats.avgScore,
    practiceMinutes: stats.practiceMinutes,
  }

  const start = (mode: Session["mode"]) => {
    const id = crypto.randomUUID()
    const s: Session = { id, mode, startedAt: new Date().toISOString(), questions: [], transcript: [] }
    pushSession(mode, s)
    router.push(`/mock-interviews/${mode}/${id}`)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">Mock Interviews</h1>
          <BackButton label="Back" />
        </div>
        <p className="text-lg text-muted-foreground">Practice technical interviews with AI-powered feedback.</p>
      </div>

      <SummaryTiles completed={tiles.completed} avgScore={tiles.avgScore} practiceMinutes={tiles.practiceMinutes} />

      <div className="grid gap-6 md:grid-cols-2">
        <InterviewModeCard
          icon={Clock}
          title="Quick Coding"
          description="30m, 2–3 problems"
          badges={["30m", "2–3 problems", "Easy→Medium"]}
          onStart={() => start("quick")}
          onView={() => setDrawerMode("quick")}
        />
        <InterviewModeCard
          icon={Code}
          title="Full Technical"
          description="60m, 3–4 problems"
          badges={["60m", "3–4 problems", "Medium→Hard"]}
          onStart={() => start("full")}
          onView={() => setDrawerMode("full")}
        />
        <InterviewModeCard
          icon={MessageSquare}
          title="Behavioral"
          description="45m, STAR"
          badges={["45m", "6 Qs", "STAR"]}
          onStart={() => start("behavioral")}
          onView={() => setDrawerMode("behavioral")}
        />
        <InterviewModeCard
          icon={Brain}
          title="System Design"
          description="45m, 1–2 systems"
          badges={["45m", "1–2 systems", "Architecture"]}
          onStart={() => start("system")}
          onView={() => setDrawerMode("system")}
        />
      </div>

      <PastSessionsDrawer mode={drawerMode} onOpenChange={setDrawerMode} />
    </div>
  )
}
