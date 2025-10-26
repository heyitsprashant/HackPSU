"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { updateSession, type Session, getSessions } from "@/lib/localStore"
import { AlertCircle, ChevronRight, Clock } from "lucide-react"

const DEFAULT_BEHAVIORAL_QUESTIONS = [
  "Tell me about yourself and your background.",
  "Describe a challenging project you worked on. What was your role?",
  "Tell me about a time you disagreed with a teammate. How did you handle it?",
  "Give me an example of when you had to learn something new quickly.",
  "Describe a situation where you had to make a decision with incomplete information.",
  "Tell me about a time you failed. What did you learn from it?",
  "How do you handle competing priorities and tight deadlines?",
  "Describe a time when you had to persuade someone to see things your way.",
]

const QUESTION_DURATION = 120 // 2 minutes per question

function getQuestionsForSession(mode: Session["mode"], sessionId: string): string[] {
  try {
    const sessions = getSessions(mode)
    const session = sessions.find(s => s.id === sessionId)
    
    // Check if session has custom questions from email parsing
    if (session?.questions && Array.isArray(session.questions)) {
      const behavioral = session.questions
        .filter((q: any) => q.type === 'behavioral' || q.category?.includes('behavioral'))
        .map((q: any) => q.question || q.text)
        .filter(Boolean)
      
      if (behavioral.length > 0) {
        return behavioral
      }
    }
  } catch (e) {
    // Fall through to default questions
  }
  
  return DEFAULT_BEHAVIORAL_QUESTIONS
}

export function BehavioralLive({ mode, sessionId, onDone }:{ mode: Session["mode"]; sessionId: string; onDone: ()=>void }){
  const videoRef = useRef<HTMLVideoElement>(null)
  const [running, setRunning] = useState(false)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [metrics, setMetrics] = useState({
    speechClarity: 0,
    toneConfidence: 0,
    emotionalStability: 0,
    eyeContact: 0,
    expressions: 0,
    engagement: 0,
  })
  const [transcript, setTranscript] = useState<string>("")
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const lastAudioChunkRef = useRef<Blob | null>(null)
  const timerRef = useRef<number | null>(null)
  const [error, setError] = useState<string>("")
  const [history, setHistory] = useState<Array<typeof metrics>>([])
  const [coaching, setCoaching] = useState<{text:string; audio?:string}|null>(null)
  const [liveInsights, setLiveInsights] = useState<{observations: string; topStrength: string; topWeakness: string} | null>(null)
  
  // Question management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(QUESTION_DURATION)
  const [questionAnswers, setQuestionAnswers] = useState<Array<{question: string; answer: string; duration: number}>>([])
  const questionTimerRef = useRef<number | null>(null)
  const [questions, setQuestions] = useState<string[]>([])

  // Load questions on mount
  useEffect(() => {
    const loadedQuestions = getQuestionsForSession(mode, sessionId)
    setQuestions(loadedQuestions)
  }, [mode, sessionId])

  useEffect(()=>{
    ;(async ()=>{
      try{
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: true })
        mediaStreamRef.current = stream
        if (videoRef.current){
          videoRef.current.srcObject = stream
          videoRef.current.muted = true
          videoRef.current.playsInline = true
          await videoRef.current.play().catch(()=>{})
        }
        // Choose best supported audio mime
        const prefer = [
          'audio/ogg;codecs=opus',
          'audio/webm;codecs=opus',
          'audio/webm'
        ]
        const mime = prefer.find((m)=> (window as any).MediaRecorder?.isTypeSupported?.(m)) || 'audio/webm'
        const rec = new MediaRecorder(stream, { mimeType: mime })
        recorderRef.current = rec
        rec.ondataavailable = (e)=> { if (e.data && e.data.size > 0) lastAudioChunkRef.current = e.data }
        // Don't start until user clicks Start
      }catch(e:any){ setError(e?.message || 'Failed to access mic/camera') }
    })()
  },[])

  // Question timer effect
  useEffect(() => {
    if (!running || !questionStartTime) return
    
    questionTimerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime.getTime()) / 1000)
      const remaining = Math.max(0, QUESTION_DURATION - elapsed)
      setTimeRemaining(remaining)
      
      // Auto-advance to next question when time runs out
      if (remaining === 0) {
        nextQuestion()
      }
    }, 1000)
    
    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current)
        questionTimerRef.current = null
      }
    }
  }, [running, questionStartTime])

  useEffect(()=>{
    if(!running) return
    setStartedAt((s)=> s ?? new Date())
    setQuestionStartTime((s)=> s ?? new Date())

    async function tick(){
      try{
        const audio = lastAudioChunkRef.current
        if (!videoRef.current || videoRef.current.readyState < 2) return
        const canvas = document.createElement('canvas')
        canvas.width = videoRef.current.videoWidth || 640
        canvas.height = videoRef.current.videoHeight || 360
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const frameBlob: Blob = await new Promise((res)=> canvas.toBlob((b)=> res(b!), 'image/jpeg', 0.7)!)

        const form = new FormData()
        form.append('sessionId', sessionId)
        if (audio) form.append('audio', audio, 'audio.webm')
        form.append('frame', frameBlob, 'frame.jpg')
        if (transcript) form.append('transcript', transcript.slice(-1000))
        const resp = await fetch('/api/behavioral/stream', { method: 'POST', body: form })
        console.log('📡 [Client] API Response status:', resp.status)
        
        if (resp.ok){
          const result = await resp.json()
          console.log('✅ [Client] Received data:', result)
          const { data } = result
          const m = data?.metrics || {}
          const alpha = 0.4
          // Update metrics with smoothing - ensure proper fallback values
          setMetrics(prev => ({
            speechClarity: Math.min(100, Math.max(0, (1-alpha)*prev.speechClarity + alpha*(typeof m.speechClarity === 'number' ? m.speechClarity : prev.speechClarity))),
            toneConfidence: Math.min(100, Math.max(0, (1-alpha)*prev.toneConfidence + alpha*(typeof m.toneConfidence === 'number' ? m.toneConfidence : prev.toneConfidence))),
            emotionalStability: Math.min(100, Math.max(0, (1-alpha)*prev.emotionalStability + alpha*(typeof m.emotionalStability === 'number' ? m.emotionalStability : prev.emotionalStability))),
            eyeContact: Math.min(100, Math.max(0, (1-alpha)*prev.eyeContact + alpha*(typeof m.eyeContact === 'number' ? m.eyeContact : prev.eyeContact))),
            expressions: Math.min(100, Math.max(0, (1-alpha)*prev.expressions + alpha*(typeof m.expressions === 'number' ? m.expressions : prev.expressions))),
            engagement: Math.min(100, Math.max(0, (1-alpha)*prev.engagement + alpha*(typeof m.engagement === 'number' ? m.engagement : prev.engagement))),
          }))
          if (data?.transcript) setTranscript(t => (t ? t + ' ' : '') + data.transcript)
          
          // Update live insights from LLM
          if (data?.observations || data?.topStrength || data?.topWeakness) {
            setLiveInsights({
              observations: data.observations || '',
              topStrength: data.topStrength || '',
              topWeakness: data.topWeakness || ''
            })
          }
          
          // Store history with current metrics values
          setHistory(h=> [...h.slice(-90), {
            speechClarity: typeof m.speechClarity === 'number' ? m.speechClarity : metrics.speechClarity,
            toneConfidence: typeof m.toneConfidence === 'number' ? m.toneConfidence : metrics.toneConfidence,
            emotionalStability: typeof m.emotionalStability === 'number' ? m.emotionalStability : metrics.emotionalStability,
            eyeContact: typeof m.eyeContact === 'number' ? m.eyeContact : metrics.eyeContact,
            expressions: typeof m.expressions === 'number' ? m.expressions : metrics.expressions,
            engagement: typeof m.engagement === 'number' ? m.engagement : metrics.engagement,
          }])
        }
      }catch(e:any){ setError(e?.message || 'Streaming error') }
    }

    timerRef.current = window.setInterval(tick, 2000)
    return ()=> { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }
  },[running, sessionId, transcript])

  const nextQuestion = () => {
    // Save current answer
    if (questionStartTime && currentQuestionIndex < questions.length) {
      const duration = Math.floor((Date.now() - questionStartTime.getTime()) / 1000)
      setQuestionAnswers(prev => [...prev, {
        question: questions[currentQuestionIndex],
        answer: transcript,
        duration
      }])
    }
    
    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setQuestionStartTime(new Date())
      setTimeRemaining(QUESTION_DURATION)
      setTranscript("") // Clear transcript for next answer
    } else {
      // All questions answered, finish session
      stop()
    }
  }

  const stop = () => {
    setRunning(false)
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (questionTimerRef.current) { clearInterval(questionTimerRef.current); questionTimerRef.current = null }
    const stream = mediaStreamRef.current
    try { recorderRef.current?.stop() } catch {}
    stream?.getTracks().forEach(t => t.stop())
    const ended = new Date()
    const durationMin = startedAt ? Math.max(1, Math.round((ended.getTime()-startedAt.getTime())/60000)) : 1
    const score = Math.round((metrics.speechClarity + metrics.toneConfidence + metrics.engagement)/3)
    updateSession(mode, sessionId, {
      endedAt: ended.toISOString(),
      durationMin,
      score,
      rubric: { metrics, transcript, questionAnswers }
    })
    onDone()
  }

  // Use default questions if none loaded yet
  const activeQuestions = questions.length > 0 ? questions : DEFAULT_BEHAVIORAL_QUESTIONS
  const currentQuestion = activeQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / activeQuestions.length) * 100
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div className="space-y-4">
      {/* Question Display Card */}
      {running && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-lg px-4 py-2">
                  Question {currentQuestionIndex + 1} of {activeQuestions.length}
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className={`font-mono text-lg ${timeRemaining < 30 ? 'text-destructive font-bold' : ''}`}>
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={nextQuestion}
                disabled={currentQuestionIndex >= activeQuestions.length - 1}
              >
                Next Question <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
              <AlertCircle className="h-6 w-6 text-primary mt-1 shrink-0" />
              <p className="text-xl font-semibold text-foreground leading-relaxed">
                {currentQuestion}
              </p>
            </div>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Use the STAR method - describe the <strong>Situation</strong>, 
                <strong> Task</strong>, <strong>Action</strong>, and <strong>Result</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interview Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <video ref={videoRef} className="w-full rounded-lg bg-black" muted playsInline />
              <div className="flex gap-2 mt-3">
                {!running ? (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={()=> { 
                      setRunning(true); 
                      recorderRef.current?.start(2000); 
                      setQuestionStartTime(new Date());
                      setError("") 
                    }}
                  >
                    Start Interview Session
                  </Button>
                ) : (
                  <Button variant="destructive" className="w-full" onClick={stop}>Finish & Save Interview</Button>
                )}
              </div>
              {!running && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Ready?</strong> You'll be asked {activeQuestions.length} behavioral questions. 
                    Each question has {QUESTION_DURATION / 60} minutes to answer.
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Performance Metrics</h3>
              {Object.entries(metrics).map(([k,v])=> (
                <div key={k}>
                  <div className="flex justify-between text-sm"><span className="capitalize">{k.replace(/([A-Z])/g,' $1')}</span><span className="font-semibold">{Math.round(v)}%</span></div>
                  <Progress value={v} className="h-2" />
                </div>
              ))}
              {/* Live Insights from LLM */}
              {running && liveInsights && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">AI Coach Insights</h3>
                  {liveInsights.observations && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                      <p className="text-blue-600 dark:text-blue-400">{liveInsights.observations}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {liveInsights.topStrength && (
                      <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">💪 Strength</p>
                        <p className="text-xs text-green-700 dark:text-green-300">{liveInsights.topStrength}</p>
                      </div>
                    )}
                    {liveInsights.topWeakness && (
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">📈 Improve</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">{liveInsights.topWeakness}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Live Transcript</h3>
                <div className="p-3 rounded bg-muted/40 text-sm whitespace-pre-wrap max-h-40 overflow-auto border">
                  {transcript || "Your response will be transcribed here..."}
                </div>
              </div>
              {running && history.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent History</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {history.slice(-6).map((h,i)=> (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sample {history.length - 6 + i + 1}</span>
                          <span className="font-semibold">{Math.round(h.speechClarity)}%</span>
                        </div>
                        <Progress value={h.speechClarity} className="h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={async ()=>{
                  setCoaching(null)
                  const resp = await fetch('/api/behavioral/coach', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ transcript, metrics, question: currentQuestion }) })
                  if (resp.ok){ const j = await resp.json(); setCoaching({ text: j.text, audio: j.audio }) }
                }}>Get Real-time Coaching</Button>
                {coaching?.audio && (<audio controls src={coaching.audio} className="h-8" />)}
              </div>
              {coaching?.text && (
                <div className="mt-2 p-3 rounded bg-primary/5 border border-primary/20 text-sm">
                  <strong className="text-primary">Coach:</strong> {coaching.text}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-4">Privacy: mic/camera are processed in-memory; no raw media is stored—only transcript and metrics.</p>
              {error && (<p className="text-xs text-destructive font-semibold">{error}</p>)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
