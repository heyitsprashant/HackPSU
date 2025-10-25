"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, Volume2, Sparkles, Loader2, BookOpen, Code, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Interview } from "./interview-manager"
import { useProgressStore } from "@/lib/store/progress-store"

const suggestedQuestions = [
  "Explain binary search trees",
  "What is the difference between stack and queue?",
  "How does dynamic programming work?",
  "Explain Big O notation",
  "What are design patterns?",
  "How do hash tables work?",
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStartTime] = useState(Date.now())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { addMentorSession, updateMentorSession } = useProgressStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const stored = localStorage.getItem("mentorverse_interviews")
    if (stored) {
      setInterviews(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0 && !sessionId) {
      const id = addMentorSession({
        topic: "General CS Topics",
        messageCount: 0,
        duration: 0,
        startedAt: new Date(sessionStartTime),
      })
      setSessionId(id)
    }
  }, [messages, sessionId, addMentorSession, sessionStartTime])

  useEffect(() => {
    if (sessionId && messages.length > 0) {
      const duration = Math.round((Date.now() - sessionStartTime) / 1000)
      updateMentorSession(sessionId, {
        messageCount: messages.length,
        duration,
      })
    }
  }, [messages, sessionId, sessionStartTime, updateMentorSession])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    let contextMessage = input.trim()
    if (interviews.length > 0) {
      const interviewContext = interviews.map((i) => `${i.company} - ${i.position} (${i.type})`).join(", ")
      contextMessage = `[User has upcoming interviews at: ${interviewContext}]\n\n${input.trim()}`
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: contextMessage },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          setMessages((prev) => {
            const updated = [...prev]
            const lastMessage = updated[updated.length - 1]
            if (lastMessage.role === "assistant") {
              lastMessage.content += chunk
            }
            return updated
          })
        }
      }

      if (voiceEnabled) {
        console.log("[v0] Voice narration enabled for response")
      }
    } catch (error) {
      console.error("[v0] Chat error:", error)
      setMessages((prev) => {
        const updated = [...prev]
        const lastMessage = updated[updated.length - 1]
        if (lastMessage.role === "assistant") {
          lastMessage.content = "Sorry, I encountered an error. Please try again."
        }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (question: string) => {
    setInput(question)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant={voiceEnabled ? "default" : "outline"} size="sm" onClick={() => setVoiceEnabled(!voiceEnabled)}>
          <Volume2 className="h-4 w-4 mr-2" />
          Voice Narration
        </Button>
      </div>

      <div className="h-[500px] overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            )}
            <Card
              className={cn(
                "max-w-[80%] shadow-sm",
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card",
              )}
            >
              <div className="p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </Card>
            {message.role === "user" && (
              <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium">You</span>
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex gap-3 justify-start">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <Card className="bg-card shadow-sm">
              <div className="p-4 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Suggested questions:</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto py-3 px-4 bg-transparent"
                onClick={() => handleSuggestionClick(question)}
              >
                <div className="flex items-start gap-2">
                  {index % 3 === 0 ? (
                    <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                  ) : index % 3 === 1 ? (
                    <Code className="h-4 w-4 mt-0.5 flex-shrink-0 text-secondary" />
                  ) : (
                    <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                  )}
                  <span className="text-sm leading-relaxed">{question}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about computer science..."
          className="min-h-[60px] max-h-[120px] resize-none"
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="lg" className="px-6">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Powered by Google Gemini 2.0</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {interviews.length > 0
                  ? `I'm aware of your ${interviews.length} upcoming interview${interviews.length > 1 ? "s" : ""} and can help you prepare!`
                  : "Add your upcoming interviews above to get personalized preparation help!"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
