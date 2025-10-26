"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent } from "@/components/ui/card"
import { BehavioralLive } from "@/components/interview/BehavioralLive"
import { Progress } from "@/components/ui/progress"
import { evaluateSubmission, generateInterview } from "@/lib/gemini-interviews"
import { getUserStats, setUserStats, pushSession, getSession, updateSession, getStudySets, type Session } from "@/lib/localStore"

export default function RunnerPage() {
  const router = useRouter()
  const params = useParams<{ mode: string; sessionId: string }>()
  const mode = (params?.mode as Session["mode"]) || "quick"
  const sessionId = (params?.sessionId as string) || ""
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [results, setResults] = useState<{ state: 'idle'|'checking'|'correct'|'wrong'; feedback?: string; improvements?: string[]; teach?: 'audio'|'visual'|'explanation'|'theory'|null; explanation?: string; image?: string | null; audio?: string | null }[]>([])
  const [playing, setPlaying] = useState<number | null>(null)
  const [startedAt] = useState<Date>(new Date())

  useEffect(() => {
    if (!mode) return
    ;(async () => {
      try {
        const seeded = getSession(mode, sessionId)
        if (seeded && seeded.questions && seeded.questions.length > 0) {
          setQuestions(seeded.questions)
          return
        }
        // Attach last email context as constraints if present
        let constraints: any = undefined
        let latest: any = null
        try {
          const sets = getStudySets()
          latest = sets[0] || null
          if (latest?.parsed) {
            constraints = {
              company: latest.parsed.company,
              position: latest.parsed.position,
              interview_type: latest.parsed.interview_type,
              skills: latest.parsed.skills,
              requirements: latest.parsed.requirements,
              experience_level: latest.parsed.experience_level,
              seedQuestions: latest.parsed.extracted_questions || [],
            }
          }
        } catch {}
        const gen = await generateInterview(mode, constraints)
        let qlist: any[] = gen.questions ?? []
        // Fallback: derive from Study categories if API empty
        if ((!qlist || qlist.length === 0) && latest?.questions?.categories) {
          const arr: any[] = []
          for (const c of latest.questions.categories) {
            for (const q of c.questions || []) {
              arr.push({ id: q.id || q.question || String(arr.length+1), title: q.question?.slice(0,60) || q.title || `Question ${arr.length+1}` , prompt: q.question || q.prompt || "" })
              if (arr.length >= 8) break
            }
            if (arr.length >= 8) break
          }
          qlist = arr
        }
        setQuestions(qlist)
        setAnswers(Array(qlist.length).fill(""))
        setResults(Array(qlist.length).fill({ state: 'idle' }))
      } finally {
        setLoading(false)
      }
    })()
  }, [mode, sessionId])

  const finish = async () => {
    // derive score from per-question results
    const correctCount = results.filter(r => r.state === 'correct').length
    const ended = new Date()
    const durationMin = Math.max(1, Math.round((ended.getTime() - startedAt.getTime()) / 60000))
    const evalRes = await evaluateSubmission(mode, { answers: results.map((r, i)=> ({ id: questions[i]?.id || String(i), correct: r.state==='correct' })) })

    // update stats
    const stats = getUserStats()
    const completed = stats.completed + 1
    const avgScore = Math.round(((stats.avgScore * stats.completed) + (evalRes.score || Math.round((correctCount/(questions.length||1))*100))) / completed)
    const practiceMinutes = (stats.practiceMinutes || 0) + durationMin
    setUserStats({ completed, avgScore, practiceMinutes })

    // push completed session
    const s: Session = {
      id: sessionId,
      mode,
      startedAt: startedAt.toISOString(),
      endedAt: ended.toISOString(),
      durationMin,
      questions: (questions || []).map((q: any, i: number) => ({ id: q.id || String(i), prompt: q.prompt || q.title || "" })),
      score: evalRes.score || 0,
      rubric: evalRes,
    }
    pushSession(mode, s)
    router.push("/mock-interviews")
  }

  if (mode === "behavioral") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BackButton href="/mock-interviews" />
            <h1 className="text-xl font-semibold capitalize">Behavioral interview</h1>
          </div>
        </div>
        <BehavioralLive mode={mode} sessionId={sessionId} onDone={()=> router.push("/mock-interviews")} />
      </div>
    )
  }

  function pushLocalAnalytics(entry: any) {
    try {
      const key = 'mv.quickSessions'
      const cur = JSON.parse(localStorage.getItem(key) || '[]')
      const next = [entry, ...cur].slice(0,100)
      localStorage.setItem(key, JSON.stringify(next))
    } catch {}
  }

  async function check(i: number) {
    if (!answers[i]?.trim()) return
    setResults((prev)=> prev.map((r,idx)=> idx===i ? { ...r, state: 'checking' } : r))
    try{
      const res = await fetch('/api/check-answer', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ question: questions[i]?.prompt || questions[i]?.title, userAnswer: answers[i] }) })
      const j = await res.json()
      const verdict = j.isCorrect ? 'correct':'wrong'
      setResults((prev)=> prev.map((r,idx)=> idx===i ? { state: verdict, feedback: j.feedback, improvements: j.improvements } : r))
      pushLocalAnalytics({ question: questions[i]?.prompt || questions[i]?.title, userAnswer: answers[i], score: j.isCorrect ? 100 : 0, verdict, date: new Date().toISOString(), duration: 0, feedback: j.feedback })
      if (j.isCorrect) triggerConfetti()
    }catch{
      setResults((prev)=> prev.map((r,idx)=> idx===i ? { ...r, state: 'wrong', feedback: 'Could not evaluate. Try again.' } : r))
      pushLocalAnalytics({ question: questions[i]?.prompt || questions[i]?.title, userAnswer: answers[i], score: 0, verdict: 'error', date: new Date().toISOString(), duration: 0, feedback: 'eval failed' })
    }
  }

  async function teach(i: number, mode: 'audio'|'visual'|'explanation'|'theory') {
    try{
      const qtext = questions[i]?.prompt || questions[i]?.title || ''
      const payload = {
        question: qtext,
        answer: answers[i] || '',
        mode: mode === 'explanation' ? 'text' : mode,
        voice: 'rachel',
      }

      const resp = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!resp.ok) return
      const data = await resp.json()
      // backend returns { ai: {...}, image?: base64, audio?: base64 }
      const ai = data?.ai || {}
      const explanation: string = ai.explanation || ai?.explanation || ''
      const imageB64: string | null = data?.image || null
      const audioB64: string | null = data?.audio || null

      setResults((prev)=> prev.map((r,idx)=> idx===i ? { ...r, teach: mode, explanation, image: imageB64, audio: audioB64 } : r))

      if (mode === 'audio' && audioB64) {
        try {
          const audio = new Audio('data:audio/mpeg;base64,' + audioB64)
          setPlaying(i)
          audio.onended = () => setPlaying(null)
          await audio.play()
        } catch (e) {
          // fallback: do nothing
        }
      }
    } catch {}
  }

  function triggerConfetti() {
    try {
      const root = document.createElement('div')
      root.style.position = 'fixed'
      root.style.inset = '0'
      root.style.pointerEvents = 'none'
      root.style.zIndex = '9999'
      document.body.appendChild(root)
      const n = 80
      for (let i=0;i<n;i++){
        const dot = document.createElement('span')
        const size = Math.random()*8+4
        dot.style.position = 'absolute'
        dot.style.left = Math.random()*100+'%'
        dot.style.top = '-10px'
        dot.style.width = size+'px'
        dot.style.height = size+'px'
        dot.style.borderRadius = '50%'
        dot.style.background = ['#60a5fa','#f472b6','#34d399','#f59e0b','#a78bfa'][i%5]
        dot.style.transform = `translateY(0)`
        dot.style.opacity = '0.9'
        root.appendChild(dot)
        const duration = 1500 + Math.random()*1000
        const x = (Math.random()*2-1)*200
        dot.animate([
          { transform: 'translate(0,-20px)', opacity: 0 },
          { transform: `translate(${x}px, 100vh)`, opacity: 1 },
        ], { duration, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = ()=> dot.remove()
      }
      setTimeout(()=> root.remove(), 1800)
    } catch {}
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BackButton href="/mock-interviews" />
          <h1 className="text-xl font-semibold capitalize">{mode} interview</h1>
        </div>
        <Button onClick={finish} aria-label="Finish interview">Finish</Button>
      </div>
      <Card className="rounded-2xl shadow-sm bg-gradient-to-b from-white to-slate-50">
        <CardContent className="p-4 space-y-4">
          {/* Progress Tracker (last 5) */}
          <Progress value={(function(){
            try{ const arr = JSON.parse(localStorage.getItem('mv.quickSessions')||'[]').slice(0,5); if(arr.length===0) return 0; const avg = arr.reduce((s:any,a:any)=> s + (a.score||0),0)/arr.length; return Math.round(avg); }catch{return 0}
          })()} className="h-2" />
          {loading ? (
            <>
              <Progress value={30} className="h-2" />
              <p className="text-sm text-muted-foreground">Generating questions…</p>
            </>
          ) : questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions generated.</p>
          ) : (
            <ul className="space-y-4">
              {questions.map((q: any, i: number) => (
                <li key={i} className="p-4 bg-white rounded-xl shadow-sm space-y-3">
                  <div>
                    <p className="text-sm font-semibold">{q.title || `Question ${i+1}`}</p>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{q.prompt}</p>
                  </div>
                  <textarea
                    className="w-full min-h-[90px] text-sm p-2 rounded-full border px-4 py-2"
                    placeholder="Type your answer here..."
                    value={answers[i] || ''}
                    onChange={(e)=> setAnswers(ans => ans.map((v,idx)=> idx===i ? e.target.value : v))}
                    disabled={results[i]?.state==='correct'}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" className="rounded-full" onClick={()=> check(i)} disabled={results[i]?.state==='checking' || !answers[i]?.trim()}> {results[i]?.state==='checking' ? 'Checking…' : 'Submit'} </Button>
                    {results[i]?.state==='wrong' && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Need help?</span>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={()=> teach(i,'audio')}>{playing===i ? 'Playing…' : 'Audio'}</Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={()=> teach(i,'visual')}>Visual</Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={()=> teach(i,'explanation')}>Explanation</Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={()=> teach(i,'theory')}>Theory</Button>
                      </div>
                    )}
                  </div>
                  {results[i]?.feedback && (
                    <div className={`text-sm p-3 rounded ${results[i].state==='correct' ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                      <p className="font-medium">{results[i].state==='correct' ? 'Correct' : 'Not quite'}</p>
                      <p className="text-muted-foreground">{results[i].feedback}</p>
                      {Array.isArray(results[i].improvements) && results[i].improvements!.length>0 && (
                        <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                          {results[i].improvements!.map((t,idx)=> (<li key={idx}>{t}</li>))}
                        </ul>
                      )}
                      {!!results[i].explanation && (
                        <div className="mt-2 whitespace-pre-wrap">{results[i].explanation}</div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
