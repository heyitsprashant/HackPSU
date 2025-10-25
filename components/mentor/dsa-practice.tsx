"use client"

import { Label } from "@/components/ui/label"
import { useProgressStore } from "@/lib/store/progress-store"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, Eye, Volume2, BookOpen, ArrowRight, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Interview } from "./interview-manager"

type DifficultyLevel = "easy" | "medium" | "hard"

type DSAQuestion = {
  id: string
  question: string
  difficulty: DifficultyLevel
  topic: string
  hints: string[]
  correctAnswer: string
}

type LearningMode = "teach" | "visual" | "audio" | "theory"

export function DSAPractice({ interview, onExit }: { interview: Interview; onExit: () => void }) {
  const [step, setStep] = useState<"level-select" | "practice" | "explanation" | "level-up">("level-select")
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>("easy")
  const [currentQuestion, setCurrentQuestion] = useState<DSAQuestion | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState("")
  const [selectedLearningMode, setSelectedLearningMode] = useState<LearningMode | null>(null)

  const { addDSAAttempt } = useProgressStore()

  const handleLevelSelect = async (level: DifficultyLevel) => {
    setSelectedLevel(level)
    setStep("practice")
    await fetchQuestion(level)
  }

  const fetchQuestion = async (level: DifficultyLevel) => {
    setLoading(true)
    try {
      const response = await fetch("/api/dsa-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: interview.company,
          position: interview.position,
          difficulty: level,
        }),
      })

      const data = await response.json()
      setCurrentQuestion(data.question)
      setUserAnswer("")
      setIsCorrect(null)
    } catch (error) {
      console.error("Error fetching question:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return

    setLoading(true)
    setTotalAttempts((prev) => prev + 1)

    try {
      const response = await fetch("/api/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          userAnswer,
          correctAnswer: currentQuestion.correctAnswer,
        }),
      })

      const data = await response.json()
      setIsCorrect(data.isCorrect)

      addDSAAttempt({
        company: interview.company,
        position: interview.position,
        difficulty: selectedLevel,
        question: currentQuestion.question,
        topic: currentQuestion.topic,
        correct: data.isCorrect,
      })

      if (data.isCorrect) {
        setCorrectCount((prev) => prev + 1)

        if ((correctCount + 1) % 3 === 0 && selectedLevel !== "hard") {
          setTimeout(() => setStep("level-up"), 1500)
        }
      }
    } catch (error) {
      console.error("Error checking answer:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLearnMore = async (mode: LearningMode) => {
    setSelectedLearningMode(mode)
    setStep("explanation")
    setLoading(true)

    try {
      const response = await fetch("/api/explain-concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion?.question,
          topic: currentQuestion?.topic,
          mode,
        }),
      })

      const data = await response.json()
      setExplanation(data.explanation)

      if (mode === "audio" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(data.explanation)
        utterance.rate = 0.9
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error("Error fetching explanation:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNextQuestion = async () => {
    setIsCorrect(null)
    setUserAnswer("")
    await fetchQuestion(selectedLevel)
  }

  const handleLevelUp = async () => {
    const nextLevel = selectedLevel === "easy" ? "medium" : "hard"
    setSelectedLevel(nextLevel)
    setStep("practice")
    setCorrectCount(0)
    await fetchQuestion(nextLevel)
  }

  const handleStaySameLevel = async () => {
    setStep("practice")
    await fetchQuestion(selectedLevel)
  }

  const handleBackFromExplanation = () => {
    setStep("practice")
    setSelectedLearningMode(null)
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }

  const getDifficultyColor = (level: DifficultyLevel) => {
    const colors = {
      easy: "bg-green-500/10 text-green-600 border-green-500/20",
      medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      hard: "bg-red-500/10 text-red-600 border-red-500/20",
    }
    return colors[level]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onExit}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h3 className="font-semibold">DSA Practice</h3>
          <p className="text-sm text-muted-foreground">
            {interview.company} - {interview.position}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">
            {correctCount}/{totalAttempts}
          </span>
        </div>
      </div>

      {step === "level-select" && (
        <div className="space-y-4">
          <Card className="p-6 text-center space-y-4">
            <div className="space-y-2">
              <h4 className="text-lg font-semibold">Choose Your Difficulty Level</h4>
              <p className="text-sm text-muted-foreground">Start with a level that matches your current skill</p>
            </div>

            <div className="grid gap-3">
              {(["easy", "medium", "hard"] as DifficultyLevel[]).map((level) => (
                <Button
                  key={level}
                  variant="outline"
                  className="h-auto py-4 justify-start bg-transparent"
                  onClick={() => handleLevelSelect(level)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Badge className={cn("capitalize", getDifficultyColor(level))}>{level}</Badge>
                    <div className="text-left flex-1">
                      <p className="font-medium capitalize">{level} Level</p>
                      <p className="text-xs text-muted-foreground">
                        {level === "easy" && "Basic concepts and simple problems"}
                        {level === "medium" && "Intermediate algorithms and data structures"}
                        {level === "hard" && "Advanced problems and optimization"}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {step === "practice" && (
        <div className="space-y-4">
          {loading && !currentQuestion ? (
            <Card className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">Generating question...</p>
            </Card>
          ) : currentQuestion ? (
            <>
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={cn("capitalize", getDifficultyColor(selectedLevel))}>{selectedLevel}</Badge>
                  <Badge variant="outline">{currentQuestion.topic}</Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Question:</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentQuestion.question}</p>
                </div>

                {currentQuestion.hints.length > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Show Hints
                    </summary>
                    <ul className="mt-2 space-y-1 pl-6 list-disc text-muted-foreground">
                      {currentQuestion.hints.map((hint, i) => (
                        <li key={i}>{hint}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </Card>

              <Card className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="answer">Your Answer:</Label>
                  <Textarea
                    id="answer"
                    placeholder="Write your solution here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                    disabled={isCorrect !== null}
                  />
                </div>

                {isCorrect === null ? (
                  <Button onClick={handleSubmitAnswer} disabled={loading || !userAnswer.trim()} className="w-full">
                    {loading ? "Checking..." : "Submit Answer"}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "p-4 rounded-lg border flex items-start gap-3",
                        isCorrect
                          ? "bg-green-500/10 border-green-500/20 text-green-600"
                          : "bg-red-500/10 border-red-500/20 text-red-600",
                      )}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold">Correct!</p>
                            <p className="text-sm mt-1">Great job! You solved this problem correctly.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold">Not quite right</p>
                            <p className="text-sm mt-1">{"Don't worry! Let's learn from this."}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {isCorrect ? (
                      <Button onClick={handleNextQuestion} className="w-full">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Next Question
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">How would you like to learn?</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" onClick={() => handleLearnMore("teach")} className="h-auto py-3">
                            <div className="flex flex-col items-center gap-2">
                              <Lightbulb className="h-5 w-5" />
                              <span className="text-xs">Teach Me</span>
                            </div>
                          </Button>
                          <Button variant="outline" onClick={() => handleLearnMore("visual")} className="h-auto py-3">
                            <div className="flex flex-col items-center gap-2">
                              <Eye className="h-5 w-5" />
                              <span className="text-xs">Visual</span>
                            </div>
                          </Button>
                          <Button variant="outline" onClick={() => handleLearnMore("audio")} className="h-auto py-3">
                            <div className="flex flex-col items-center gap-2">
                              <Volume2 className="h-5 w-5" />
                              <span className="text-xs">Audio</span>
                            </div>
                          </Button>
                          <Button variant="outline" onClick={() => handleLearnMore("theory")} className="h-auto py-3">
                            <div className="flex flex-col items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              <span className="text-xs">Theory</span>
                            </div>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </>
          ) : null}
        </div>
      )}

      {step === "explanation" && (
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {selectedLearningMode === "teach" && <Lightbulb className="h-5 w-5 text-primary" />}
                {selectedLearningMode === "visual" && <Eye className="h-5 w-5 text-primary" />}
                {selectedLearningMode === "audio" && <Volume2 className="h-5 w-5 text-primary" />}
                {selectedLearningMode === "theory" && <BookOpen className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <h4 className="font-semibold capitalize">{selectedLearningMode} Mode</h4>
                <p className="text-sm text-muted-foreground">{currentQuestion?.topic}</p>
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{explanation}</div>
              </div>
            )}
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleBackFromExplanation} variant="outline" className="flex-1 bg-transparent">
              Back to Question
            </Button>
            <Button onClick={handleNextQuestion} className="flex-1">
              Try Another Question
            </Button>
          </div>
        </div>
      )}

      {step === "level-up" && (
        <Card className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <div className="h-16 w-16 rounded-full bg-yellow-500/10 mx-auto flex items-center justify-center">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <h4 className="text-xl font-bold">Great Progress!</h4>
            <p className="text-sm text-muted-foreground">
              {"You've"} answered 3 questions correctly. Ready for a challenge?
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleStaySameLevel} variant="outline" className="flex-1 bg-transparent">
              Stay at {selectedLevel}
            </Button>
            <Button onClick={handleLevelUp} className="flex-1">
              Level Up to {selectedLevel === "easy" ? "Medium" : "Hard"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
