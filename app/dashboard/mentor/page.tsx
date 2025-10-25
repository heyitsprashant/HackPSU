"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Briefcase } from "lucide-react"
import { ChatInterface } from "@/components/mentor/chat-interface"
import { InterviewManager } from "@/components/mentor/interview-manager"

export default function MentorPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">AI Mentor</h1>
        <p className="text-lg text-muted-foreground">
          Get instant help and explanations from your personal AI mentor powered by Google Gemini 2.0
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Track your interviews and get personalized preparation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <InterviewManager />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <CardTitle>Chat with Your AI Mentor</CardTitle>
              <CardDescription>Ask questions, get explanations, and learn at your own pace</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  )
}
