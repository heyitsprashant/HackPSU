"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, Sparkles, Loader2, BookOpen, Code, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProgressStore } from "@/lib/store/progress-store"
import { getStudySets } from "@/lib/localStore"

const defaultSuggestions = [
  "Explain binary search trees",
  "How does dynamic programming work?",
  "What are design patterns?",
  "Explain Big O notation",
  "Difference between stack and queue?",
  "How do hash tables work?",
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatWithCoach() {
  const [messages, setMessages] = useState<Message[]>([])
  const latestStudy = useMemo(() => {
    const sets = getStudySets()
    return sets[0]
  }, [])
  const suggestedQuestions = useMemo(() => {
    try {
      const latest = latestStudy
      if (!latest) return defaultSuggestions
      const company = latest.summary?.company || latest.parsed?.company || "the company"
      const role = latest.summary?.position || latest.parsed?.position || "the role"
      const qs: string[] = []
      for (const c of latest.questions?.categories || []) {
        for (const q of c.questions?.slice(0, 2) || []) {
          if (q?.question) qs.push(q.question)
        }
        if (qs.length >= 6) break
      }
      const emailQs: string[] = Array.isArray(latest.parsed?.extracted_questions) ? latest.parsed.extracted_questions.slice(0,4) : []
      qs.unshift(...emailQs)
      const tailored = [
        `How to prepare for ${company} ${latest.parsed?.interview_type || "technical"} round?`,
        `What topics does ${company} emphasize for ${role}?`,
      ]
      const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)))
      return uniq([...qs, ...tailored]).slice(0, 8)
    } catch { return defaultSuggestions }
  }, [latestStudy])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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
    if (messages.length > 0 && !sessionId) {
      const id = addMentorSession({
        topic: "General CS Topics",
        messageCount: 0,
        duration: 0,
        startedAt: new Date(sessionStartTime),
      })
      if (id) setSessionId(id)
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
      // Build hidden context for the model about the user's upcoming interview
      const ctx = latestStudy
        ? `[User has upcoming interviews: company=${latestStudy.parsed?.company || latestStudy.summary?.company}; position=${latestStudy.parsed?.position || latestStudy.summary?.position}; type=${latestStudy.parsed?.interview_type}]`
        : ""

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...(ctx ? [{ role: "user", content: ctx }] : []),
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: input.trim() },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          accumulatedText += chunk
          
          setMessages((prev) => {
            const updated = [...prev]
            const lastMessage = updated[updated.length - 1]
            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content = accumulatedText
            }
            return updated
          })
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
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

  useEffect(() => {
    const onAsk = (e: any) => handleSuggestionClick(e.detail)
    window.addEventListener("ask-question" as any, onAsk)
    return () => window.removeEventListener("ask-question" as any, onAsk)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-4">
      <div className="h-[400px] overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-xl">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            )}
            <Card
              className={cn(
                "max-w-[80%] shadow-sm rounded-xl",
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
            <Card className="bg-card shadow-sm rounded-xl">
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
          <div className="grid grid-cols-1 gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto py-3 px-4 bg-transparent rounded-xl hover:bg-muted/50"
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
          className="min-h-[60px] max-h-[120px] resize-none rounded-xl"
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="lg" className="px-6 rounded-xl">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}