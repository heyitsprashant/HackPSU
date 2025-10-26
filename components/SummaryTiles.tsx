"use client"

import { Card, CardContent } from "@/components/ui/card"

export function SummaryTiles({ completed, avgScore, practiceMinutes }:{ completed: number; avgScore: number; practiceMinutes: number }){
  const blank = completed === 0
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="rounded-2xl shadow-sm"><CardContent className="p-4"><div className="space-y-1"><p className="text-sm text-muted-foreground">Interviews Completed</p><p className="text-3xl font-bold">{blank ? "—" : completed}</p></div></CardContent></Card>
      <Card className="rounded-2xl shadow-sm"><CardContent className="p-4"><div className="space-y-1"><p className="text-sm text-muted-foreground">Average Score</p><p className="text-3xl font-bold">{blank ? "—" : `${avgScore}%`}</p></div></CardContent></Card>
      <Card className="rounded-2xl shadow-sm"><CardContent className="p-4"><div className="space-y-1"><p className="text-sm text-muted-foreground">Practice Time</p><p className="text-3xl font-bold">{blank ? "—" : `${practiceMinutes}m`}</p></div></CardContent></Card>
    </div>
  )
}
