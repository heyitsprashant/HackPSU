"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Target, BookOpen, Brain } from "lucide-react"
import { ChatWithCoach } from "@/components/interview/ChatWithCoach"
import { PracticeStats } from "@/components/interview/PracticeStats"
import { QuestionSuggestions } from "@/components/interview/QuestionSuggestions"
import { BackButton } from "@/components/ui/back-button"

export default function InterviewAssistantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-foreground">AI Interview Assistant</h1>
            <BackButton label="Back" />
          </div>
          <p className="text-lg text-muted-foreground max-w-4xl">
            Ask questions, get explanations, and practice at your own pace.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Chat (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="p-4 pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Chat with your AI coach</CardTitle>
                    <CardDescription>Learn concepts, solve problems, and get feedback</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ChatWithCoach />
              </CardContent>
            </Card>
          </div>

          {/* Right: Stats + Suggestions (1/3) */}
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="p-4 pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Practice Stats</CardTitle>
                    <CardDescription>Sessions, questions, and streak</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <PracticeStats />
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="p-4 pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Suggested questions</CardTitle>
                    <CardDescription>Tap a chip to ask instantly</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <QuestionSuggestions />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer removed per request */}
      </div>
    </div>
  )
}
