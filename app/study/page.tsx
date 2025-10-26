"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Loader2, CheckCircle2, XCircle, Brain, Zap, Target, Play, Bot } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StudyPracticeAutomation } from "@/lib/gemini-automation"
import { createSessionFromEmail } from "@/lib/localStore"
import { BackButton } from "@/components/ui/back-button"

interface ParsedEmailData {
  company: string
  position: string
  interview_type: string
  date: string
  time: string
  location: string
  requirements: string[]
  skills: string[]
  experience_level: string
  additional_notes: string
}

interface GeneratedQuestions {
  categories: Array<{
    name: string
    description: string
    icon: string
    questions: Array<{
      question: string
      difficulty: string
      expected_answer: string
      tips: string[]
    }>
  }>
}

export default function StudyPracticePage() {
  const router = useRouter()
  const [quickStart, setQuickStart] = useState<{ mode: "quick"|"full"|"behavioral"|"system"; id: string } | null>(null)
  const [emailContent, setEmailContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedEmailData | null>(null)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestions | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'email' | 'parsed' | 'questions'>('email')
  const [automationEnabled, setAutomationEnabled] = useState(false)
  const [automation, setAutomation] = useState<StudyPracticeAutomation | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Load last saved study set — handled in dashboard version previously; keep minimal here
  useEffect(() => {}, [])

  // Initialize automation on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      const automationInstance = new StudyPracticeAutomation(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
      setAutomation(automationInstance)
    }
  }, [])

  const handleParseEmail = async () => {
    if (!emailContent.trim()) {
      setError("Please enter email content")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/parse-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: emailContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to parse email")
      }

      const data = await response.json()
      setParsedData(data)
      setCurrentStep('parsed')

      // Automatically generate questions after parsing
      await generateQuestions(data)

      // Trigger automation if enabled - complete workflow
      if (automationEnabled) {
        let timeLeft = 5
        setCountdown(timeLeft)

        const countdownInterval = setInterval(() => {
          timeLeft -= 1
          setCountdown(timeLeft)

          if (timeLeft <= 0) {
            clearInterval(countdownInterval)
            setCountdown(null)
            window.location.href = '/interview-assistant'
          }
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const generateQuestions = async (parsedData: ParsedEmailData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      })

      if (!response.ok) {
        throw new Error("Failed to generate questions")
      }

      const data = await response.json()
      setGeneratedQuestions(data)
      setCurrentStep('questions')
      try {
        const created = createSessionFromEmail(parsedData, data)
        setQuickStart(created)
      } catch {}
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const resetFlow = () => {
    setEmailContent("")
    setParsedData(null)
    setGeneratedQuestions(null)
    setError(null)
    setCurrentStep('email')
  }

  if (currentStep === 'email') {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-foreground">Study Practice</h1>
            <BackButton label="Back" />
          </div>
          <p className="text-lg text-muted-foreground">
            Upload your interview email to get personalized practice questions generated by AI
          </p>
        </div>

        {/* Automation Toggle */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">AI Automation</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically process email and navigate to interview coach (20-25 seconds)
                </p>
              </div>
              <Button 
                variant={automationEnabled ? "default" : "outline"} 
                onClick={() => setAutomationEnabled(!automationEnabled)}
                className="ml-4"
              >
                {automationEnabled ? "Enabled" : "Enable"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Upload Interview Email</CardTitle>
                <CardDescription>
                  Paste your interview invitation email to generate personalized practice questions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Email Content</Label>
              <Textarea
                id="content"
                placeholder="Paste your interview invitation email content here..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={10}
                className="min-h-[200px]"
              />
            </div>
            <Button onClick={handleParseEmail} disabled={isLoading || !emailContent.trim()} className="w-full parse-email-btn">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {automationEnabled ? 'Processing & Auto-navigating...' : 'Parsing Email...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {automationEnabled ? 'Process & Auto-Start Practice' : 'Parse Email & Generate Questions'}
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === 'parsed' && parsedData) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Email Parsed Successfully!</h1>
          <p className="text-lg text-muted-foreground">
            Generating personalized practice questions based on your interview details
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Interview Details Extracted</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Company</p>
                <p className="text-lg font-bold text-foreground">{parsedData.company || 'Not detected'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Position</p>
                <p className="text-lg font-bold text-foreground">{parsedData.position || 'Not detected'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Interview Type</p>
                <p className="text-lg font-bold text-foreground">{parsedData.interview_type || 'Not detected'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Scheduled</p>
                <p className="text-lg font-bold text-foreground">{parsedData.date || '—'} {parsedData.time || ''}</p>
              </div>
            </div>
            
            {parsedData.skills && parsedData.skills.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {parsedData.requirements && parsedData.requirements.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Requirements</p>
                <ul className="list-disc list-inside space-y-1">
                  {parsedData.requirements.map((req, idx) => (
                    <li key={idx} className="text-sm text-foreground">{req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {parsedData.additional_notes && (
              <div className="mt-6 space-y-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Additional Notes</p>
                <p className="text-sm text-foreground">{parsedData.additional_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Generated Practice Questions</h1>
        <p className="text-lg text-muted-foreground">Based on your interview email</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Practice Questions</CardTitle>
          <CardDescription>AI-generated questions tailored to your interview</CardDescription>
        </CardHeader>
        <CardContent>
          {generatedQuestions ? (
            <div className="space-y-6">
              {generatedQuestions.categories.map((cat, i) => (
                <div key={i} className="p-5 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                      <h3 className="text-xl font-bold text-foreground">{cat.name}</h3>
                    </div>
                    <Badge variant="default" className="text-sm px-3 py-1">
                      {cat.questions.length} Question{cat.questions.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  {cat.description && (
                    <p className="text-sm text-muted-foreground mb-4 italic">{cat.description}</p>
                  )}
                  
                  <div className="space-y-4">
                    {cat.questions.map((q, qi) => (
                      <div key={qi} className="bg-background/50 p-4 rounded-md border border-border">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1 shrink-0">
                            Q{qi + 1}
                          </Badge>
                          <div className="flex-1 space-y-2">
                            <p className="font-semibold text-foreground">{q.question}</p>
                            
                            {q.difficulty && (
                              <Badge 
                                variant={q.difficulty === 'easy' ? 'secondary' : q.difficulty === 'medium' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {q.difficulty}
                              </Badge>
                            )}
                            
                            {q.tips && q.tips.length > 0 && (
                              <div className="mt-3 space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tips:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {q.tips.map((tip, ti) => (
                                    <li key={ti} className="text-xs text-muted-foreground">{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No questions generated yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={resetFlow}>Start Over</Button>
        <Button asChild>
          <a href="/interview-assistant">Open Interview Assistant</a>
        </Button>
        {quickStart && (
          <Button onClick={() => router.push(`/mock-interviews/${quickStart.mode}/${quickStart.id}`)}>
            Start Mock Interview
          </Button>
        )}
      </div>
    </div>
  )
}
