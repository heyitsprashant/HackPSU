"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Building2, Calendar, Briefcase, Code2, Mail, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { DSAPractice } from "./dsa-practice"
import { Textarea } from "@/components/ui/textarea"

export type Interview = {
  id: string
  company: string
  position: string
  type: "technical" | "behavioral" | "system-design" | "coding" | "phone-screen"
  date: string
}

export function InterviewManager() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showEmailParser, setShowEmailParser] = useState(false)
  const [showEmailForwarding, setShowEmailForwarding] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const [practiceMode, setPracticeMode] = useState<{ active: boolean; interview: Interview | null }>({
    active: false,
    interview: null,
  })
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    type: "technical" as Interview["type"],
    date: "",
  })

  const forwardingEmail = `interviews+${userEmail.replace(/[^a-zA-Z0-9]/g, "")}@mentorverse.app`

  const handleAdd = () => {
    if (!formData.company || !formData.position || !formData.date) return

    const newInterview: Interview = {
      id: Date.now().toString(),
      ...formData,
    }

    setInterviews((prev) => [...prev, newInterview])
    setFormData({ company: "", position: "", type: "technical", date: "" })
    setShowForm(false)

    const stored = localStorage.getItem("mentorverse_interviews")
    const existing = stored ? JSON.parse(stored) : []
    localStorage.setItem("mentorverse_interviews", JSON.stringify([...existing, newInterview]))
  }

  const handleDelete = (id: string) => {
    setInterviews((prev) => prev.filter((i) => i.id !== id))

    const stored = localStorage.getItem("mentorverse_interviews")
    if (stored) {
      const existing = JSON.parse(stored)
      localStorage.setItem("mentorverse_interviews", JSON.stringify(existing.filter((i: Interview) => i.id !== id)))
    }
  }

  const handleStartPractice = (interview: Interview) => {
    setPracticeMode({ active: true, interview })
  }

  const handleExitPractice = () => {
    setPracticeMode({ active: false, interview: null })
  }

  const handleParseEmail = async () => {
    if (!emailContent.trim()) return

    setIsParsing(true)
    try {
      const response = await fetch("/api/parse-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailContent }),
      })

      const data = await response.json()

      if (data.interviews && data.interviews.length > 0) {
        const newInterviews = data.interviews.map((interview: Omit<Interview, "id">) => ({
          ...interview,
          id: Date.now().toString() + Math.random(),
        }))

        setInterviews((prev) => [...prev, ...newInterviews])

        const stored = localStorage.getItem("mentorverse_interviews")
        const existing = stored ? JSON.parse(stored) : []
        localStorage.setItem("mentorverse_interviews", JSON.stringify([...existing, ...newInterviews]))

        setEmailContent("")
        setShowEmailParser(false)
      }
    } catch (error) {
      console.error("Error parsing email:", error)
    } finally {
      setIsParsing(false)
    }
  }

  const getTypeColor = (type: Interview["type"]) => {
    const colors = {
      technical: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      behavioral: "bg-green-500/10 text-green-600 border-green-500/20",
      "system-design": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      coding: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      "phone-screen": "bg-pink-500/10 text-pink-600 border-pink-500/20",
    }
    return colors[type]
  }

  if (practiceMode.active && practiceMode.interview) {
    return <DSAPractice interview={practiceMode.interview} onExit={handleExitPractice} />
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Email Forwarding</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowEmailForwarding(!showEmailForwarding)}>
                {showEmailForwarding ? "Hide" : "Show"} Details
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Forward interview emails directly to your unique address and we'll automatically schedule them
            </p>

            {showEmailForwarding && (
              <div className="mt-3 space-y-3 pt-3 border-t">
                <div className="space-y-2">
                  <Label htmlFor="user-email" className="text-xs">
                    Your Email Address
                  </Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>

                {userEmail && (
                  <div className="space-y-2">
                    <Label className="text-xs">Your Unique Forwarding Address</Label>
                    <div className="flex gap-2">
                      <Input value={forwardingEmail} readOnly className="h-8 text-sm font-mono bg-muted" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(forwardingEmail)
                        }}
                        className="h-8"
                      >
                        Copy
                      </Button>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-medium text-blue-600">How to use:</p>
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Forward interview invitation emails to the address above</li>
                        <li>Our AI will automatically parse the details</li>
                        <li>Interviews will appear in your schedule instantly</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {interviews.length === 0 && !showForm && !showEmailParser ? (
        <div className="text-center py-8 space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">No upcoming interviews</p>
            <p className="text-sm text-muted-foreground">Add your interviews to get personalized preparation</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Interview
            </Button>
            <Button variant="outline" onClick={() => setShowEmailParser(true)}>
              <Mail className="h-4 w-4 mr-2" />
              Parse from Email
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {interviews.map((interview) => (
              <Card key={interview.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p className="font-semibold">{interview.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{interview.position}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {new Date(interview.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full border font-medium",
                          getTypeColor(interview.type),
                        )}
                      >
                        {interview.type.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(interview.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleStartPractice(interview)}
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    Practice DSA Questions to Crack This Interview
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {!showForm && !showEmailParser && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(true)} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Interview Manually
              </Button>
              <Button variant="outline" onClick={() => setShowEmailParser(true)} className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Parse from Email
              </Button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <Card className="p-4 space-y-4 border-primary/20 bg-primary/5">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              placeholder="e.g., Google, Microsoft, Amazon"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              placeholder="e.g., Software Engineer, Frontend Developer"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Interview Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as Interview["type"] })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Interview</SelectItem>
                <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                <SelectItem value="system-design">System Design</SelectItem>
                <SelectItem value="coding">Coding Challenge</SelectItem>
                <SelectItem value="phone-screen">Phone Screen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Interview Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex-1">
              Add Interview
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {showEmailParser && (
        <Card className="p-4 space-y-4 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Parse Interview from Email</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Copy and paste your interview invitation email below. Our AI will automatically extract the company,
            position, date, and interview type.
          </p>

          <div className="space-y-2">
            <Label htmlFor="email-content">Email Content</Label>
            <Textarea
              id="email-content"
              placeholder="Paste your interview invitation email here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              rows={10}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleParseEmail} className="flex-1" disabled={isParsing || !emailContent.trim()}>
              {isParsing ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Parsing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Parse Email
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowEmailParser(false)} className="flex-1" disabled={isParsing}>
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
