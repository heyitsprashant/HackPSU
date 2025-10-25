"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Volume2, Focus, CheckCircle2, XCircle, Lightbulb, ArrowRight } from "lucide-react"
import { generateQuestion, type Question } from "@/lib/question-generator"
import { cn } from "@/lib/utils"

type StudySessionProps = {
  topic: string
  difficulty: "easy" | "medium" | "hard"
  onEnd: () => void
}

export function StudySession({ topic, difficulty, onEnd }: StudySessionProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [focusMode, setFocusMode] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const totalQuestions = 10

  useEffect(() => {
    loadNewQuestion()
  }, [])

  useEffect(() => {
    if (voiceEnabled && currentQuestion) {
      speakQuestion()
    }
  }, [currentQuestion, voiceEnabled])

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const loadNewQuestion = () => {
    const question = generateQuestion(topic, difficulty)
    setCurrentQuestion(question)
    setSelectedAnswer(null)
    setUserAnswer("")
    setShowFeedback(false)
  }

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

    let textToSpeak = `Question ${questionNumber} of ${totalQuestions}. ${currentQuestion.question}`

    if (currentQuestion.type === "multiple-choice" && currentQuestion.options) {
      textToSpeak += ". The options are: "
      currentQuestion.options.forEach((option, index) => {
        textToSpeak += `Option ${index + 1}: ${option}. `
      })
    }

    speakText(textToSpeak)
  }

  const handleSubmit = () => {
    if (!currentQuestion) return

    let correct = false
    if (currentQuestion.type === "multiple-choice") {
      correct = selectedAnswer === currentQuestion.correctAnswer
    } else {
      correct = userAnswer.toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase())
    }

    setIsCorrect(correct)
    setShowFeedback(true)
    if (correct) {
      setScore(score + 1)
    }

    if (voiceEnabled) {
      const feedbackText = correct
        ? `Correct! ${currentQuestion.explanation}`
        : `Not quite right. ${currentQuestion.explanation}`
      speakText(feedbackText)
    }
  }

  const handleNext = () => {
    if (questionNumber < totalQuestions) {
      setQuestionNumber(questionNumber + 1)
      loadNewQuestion()
    } else {
      const finalMessage = `Session complete! Your score: ${score} out of ${totalQuestions}`
      if (voiceEnabled) {
        speakText(finalMessage)
      }
      alert(finalMessage)
      onEnd()
    }
  }

  const toggleVoice = () => {
    if (voiceEnabled && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setVoiceEnabled(!voiceEnabled)
  }

  if (!currentQuestion) {
    return <div>Loading...</div>
  }

  return (
    <div className={cn("space-y-6", focusMode && "max-w-3xl mx-auto")}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onEnd}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Topics
        </Button>
        <div className="flex gap-2">
          <Button variant={voiceEnabled ? "default" : "outline"} size="sm" onClick={toggleVoice}>
            <Volume2 className="h-4 w-4 mr-2" />
            Voice
          </Button>
          <Button variant={focusMode ? "default" : "outline"} size="sm" onClick={() => setFocusMode(!focusMode)}>
            <Focus className="h-4 w-4 mr-2" />
            Focus Mode
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Question {questionNumber} of {totalQuestions}
              </span>
              <span className="font-medium">
                Score: {score}/{questionNumber - 1}
              </span>
            </div>
            <Progress value={(questionNumber / totalQuestions) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex gap-2">
                <Badge variant="outline">{currentQuestion.topic}</Badge>
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
            </div>
            <Button variant="ghost" size="sm" onClick={speakQuestion} title="Read question and options aloud">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Answer Options */}
          {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showFeedback && setSelectedAnswer(option)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all",
                    "hover:border-primary hover:bg-primary/5",
                    selectedAnswer === option && !showFeedback && "border-primary bg-primary/10",
                    showFeedback && option === currentQuestion.correctAnswer && "border-green-500 bg-green-500/10",
                    showFeedback &&
                      selectedAnswer === option &&
                      option !== currentQuestion.correctAnswer &&
                      "border-red-500 bg-red-500/10",
                    showFeedback && "cursor-not-allowed",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        selectedAnswer === option &&
                          !showFeedback &&
                          "border-primary bg-primary text-primary-foreground",
                        showFeedback &&
                          option === currentQuestion.correctAnswer &&
                          "border-green-500 bg-green-500 text-white",
                        showFeedback &&
                          selectedAnswer === option &&
                          option !== currentQuestion.correctAnswer &&
                          "border-red-500 bg-red-500 text-white",
                      )}
                    >
                      {showFeedback && option === currentQuestion.correctAnswer && <CheckCircle2 className="h-4 w-4" />}
                      {showFeedback && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>
                    <span className="leading-relaxed">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "text" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Your Answer:</label>
              <Textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[120px] text-base leading-relaxed"
                disabled={showFeedback}
              />
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <Card
              className={cn(
                "border-2",
                isCorrect ? "border-green-500 bg-green-500/5" : "border-orange-500 bg-orange-500/5",
              )}
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  ) : (
                    <Lightbulb className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
                  )}
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-lg">{isCorrect ? "Correct!" : "Not quite right"}</h3>
                    <p className="text-muted-foreground leading-relaxed">{currentQuestion.explanation}</p>
                    {!isCorrect && currentQuestion.hint && (
                      <div className="mt-3 p-3 bg-background rounded-lg">
                        <p className="text-sm font-medium mb-1">Hint:</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{currentQuestion.hint}</p>
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
              <Button
                onClick={handleSubmit}
                disabled={currentQuestion.type === "multiple-choice" ? !selectedAnswer : !userAnswer.trim()}
                className="flex-1"
                size="lg"
              >
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
                  "Finish Session"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Tip */}
      {!focusMode && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Accessibility Tip</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enable Focus Mode to minimize distractions, or turn on Voice narration to hear questions read aloud.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
