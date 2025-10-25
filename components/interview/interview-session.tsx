"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Play, Pause, CheckCircle2, AlertCircle, Lightbulb, ArrowRight, Volume2 } from "lucide-react"
import { generateInterviewQuestion, type InterviewQuestion } from "@/lib/interview-generator"
import { cn } from "@/lib/utils"
import { useProgressStore, type DifficultyLevel } from "@/lib/store/progress-store"

type InterviewSessionProps = {
  type: "quick" | "full" | "behavioral" | "system-design"
  onEnd: () => void
}

export function InterviewSession({ type, onEnd }: InterviewSessionProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [answer, setAnswer] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(1800)
  const [isPaused, setIsPaused] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [score, setScore] = useState(0)
  const [questionsHistory, setQuestionsHistory] = useState<{ question: string; correct: boolean }[]>([])
  const [startTime] = useState(Date.now())

  const { addInterviewAttempt } = useProgressStore()

  const totalQuestions = type === "quick" ? 2 : type === "full" ? 4 : type === "behavioral" ? 6 : 2
  const totalTime = type === "quick" ? 1800 : type === "full" ? 3600 : 2700

  useEffect(() => {
    if (selectedDifficulty) {
      loadNewQuestion()
      setTimeRemaining(totalTime)
    }
  }, [selectedDifficulty])

  useEffect(() => {
    if (timeRemaining > 0 && !isPaused && !showFeedback && selectedDifficulty) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeRemaining, isPaused, showFeedback, selectedDifficulty])

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (voiceEnabled && currentQuestion) {
      speakQuestion()
    }
  }, [currentQuestion, voiceEnabled])

  const speakText = (text: string, rate = 0.9) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const speakQuestion = () => {
    if (!currentQuestion) return

    let textToSpeak = `Interview question ${questionNumber} of ${totalQuestions}. ${currentQuestion.question}`

    if (currentQuestion.context) {
      textToSpeak += `. Context: ${currentQuestion.context}`
    }

    if (currentQuestion.hints && currentQuestion.hints.length > 0) {
      textToSpeak += `. Here are some hints: ${currentQuestion.hints.join(". ")}`
    }

    speakText(textToSpeak)
  }

  const loadNewQuestion = () => {
    if (!selectedDifficulty) return
    const question = generateInterviewQuestion(type, selectedDifficulty)
    setCurrentQuestion(question)
    setAnswer("")
    setShowFeedback(false)
  }

  const handleSubmit = () => {
    if (!currentQuestion || !answer.trim()) return

    const hasKeywords = currentQuestion.keywords?.some((keyword) =>
      answer.toLowerCase().includes(keyword.toLowerCase()),
    )
    const isGoodLength = answer.length > 100
    const questionScore = hasKeywords && isGoodLength ? 1 : 0.5
    const isCorrect = questionScore >= 0.7

    setScore(score + questionScore)
    setQuestionsHistory([...questionsHistory, { question: currentQuestion.question, correct: isCorrect }])
    setShowFeedback(true)

    if (voiceEnabled) {
      const feedbackText = `${currentQuestion.feedback.positive}. ${currentQuestion.feedback.improvement}`
      speakText(feedbackText)
    }
  }

  const handleNext = () => {
    if (questionNumber < totalQuestions) {
      setQuestionNumber(questionNumber + 1)
      loadNewQuestion()
    } else {
      const finalScore = Math.round((score / totalQuestions) * 100)
      const duration = Math.round((Date.now() - startTime) / 1000)

      if (selectedDifficulty) {
        addInterviewAttempt({
          type,
          difficulty: selectedDifficulty,
          score: finalScore,
          duration,
          questions: questionsHistory,
        })
      }

      const completionMessage = `Interview complete! Your score: ${finalScore} percent`
      if (voiceEnabled) {
        speakText(completionMessage)
      }
      alert(completionMessage)
      onEnd()
    }
  }

  const toggleVoice = () => {
    if (voiceEnabled && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setVoiceEnabled(!voiceEnabled)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!selectedDifficulty) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onEnd}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Choose Difficulty Level</h2>
            <p className="text-sm text-muted-foreground">Select the difficulty for your {type} interview</p>
          </div>
        </div>

        <div className="grid gap-4 max-w-2xl">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => setSelectedDifficulty("easy")}
          >
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Easy</Badge>
                <h3 className="text-lg font-semibold">Easy Level</h3>
                <p className="text-sm text-muted-foreground">
                  Basic questions focusing on fundamental concepts and simple problem-solving
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => setSelectedDifficulty("medium")}
          >
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Medium</Badge>
                <h3 className="text-lg font-semibold">Medium Level</h3>
                <p className="text-sm text-muted-foreground">
                  Intermediate questions requiring solid understanding and problem-solving skills
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => setSelectedDifficulty("hard")}
          >
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Hard</Badge>
                <h3 className="text-lg font-semibold">Hard Level</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced questions testing deep knowledge, optimization, and complex problem-solving
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onEnd}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit Interview
        </Button>
        <div className="flex gap-2">
          <Button variant={voiceEnabled ? "default" : "outline"} size="sm" onClick={toggleVoice}>
            <Volume2 className="h-4 w-4 mr-2" />
            Voice
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
        </div>
      </div>

      {/* Progress and Timer */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  Question {questionNumber} of {totalQuestions}
                </span>
              </div>
              <Progress value={(questionNumber / totalQuestions) * 100} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className={cn("h-5 w-5", timeRemaining < 300 && "text-destructive")} />
                <span className="text-sm text-muted-foreground">Time Remaining</span>
              </div>
              <span className={cn("text-2xl font-bold", timeRemaining < 300 && "text-destructive")}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex gap-2">
                <Badge variant="outline">{currentQuestion.category}</Badge>
                <Badge
                  variant={
                    currentQuestion.difficulty === "easy"
                      ? "secondary"
                      : currentQuestion.difficulty === "medium"
                        ? "default"
                        : "destructive"
                  }
                >
                  {currentQuestion.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-2xl leading-relaxed">{currentQuestion.question}</CardTitle>
              {currentQuestion.context && (
                <p className="text-muted-foreground leading-relaxed">{currentQuestion.context}</p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={speakQuestion} title="Read question aloud">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Answer Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Your Answer:</label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={
                type === "behavioral"
                  ? "Use the STAR method: Situation, Task, Action, Result..."
                  : "Explain your approach and write your solution..."
              }
              className="min-h-[300px] text-base leading-relaxed font-mono"
              disabled={showFeedback}
            />
            <p className="text-xs text-muted-foreground">{answer.length} characters</p>
          </div>

          {/* Hints */}
          {!showFeedback && currentQuestion.hints && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Hints:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                      {currentQuestion.hints.map((hint, index) => (
                        <li key={index}>• {hint}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback */}
          {showFeedback && (
            <Card className="border-2 border-primary bg-primary/5">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div className="space-y-3 flex-1">
                    <h3 className="font-semibold text-lg">Feedback</h3>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">What you did well:</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {currentQuestion.feedback.positive}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Areas for improvement:</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {currentQuestion.feedback.improvement}
                      </p>
                    </div>
                    {currentQuestion.feedback.optimalSolution && (
                      <div className="space-y-2 mt-4 p-4 bg-background rounded-lg">
                        <p className="text-sm font-medium">Optimal Approach:</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {currentQuestion.feedback.optimalSolution}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!showFeedback ? (
              <Button onClick={handleSubmit} disabled={!answer.trim()} className="flex-1" size="lg">
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1" size="lg">
                {questionNumber < totalQuestions ? (
                  <>
                    Next Question
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  "Finish Interview"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interview Tips */}
      {!showFeedback && (
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Interview Tip</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {type === "behavioral"
                    ? "Use the STAR method: describe the Situation, Task, Action you took, and Result achieved."
                    : "Explain your thought process before coding. Discuss time and space complexity of your solution."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
