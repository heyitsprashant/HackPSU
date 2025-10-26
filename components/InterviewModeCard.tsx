"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ComponentType } from "react"

export function InterviewModeCard({ icon: Icon, title, description, badges, onStart, onView }:{
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  badges: string[]
  onStart: () => void
  onView: () => void
}) {
  return (
    <Card className="rounded-2xl shadow-sm hover:ring-1 ring-primary/20">
      <CardHeader>
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <Badge key={b} variant="secondary" className="rounded-full">{b}</Badge>
          ))}
        </div>
        <div className="flex gap-3">
          <Button className="flex-1" onClick={onStart} aria-label={`Start ${title}`}>Start {title}</Button>
          <Button variant="link" onClick={onView} aria-label="View past sessions">View past sessions</Button>
        </div>
      </CardContent>
    </Card>
  )
}
