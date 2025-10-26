"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { getStudySets } from "@/lib/localStore"

export function QuestionSuggestions() {
  const suggestions = useMemo(() => {
    try {
      const sets = getStudySets()
      const latest = sets[0]
      if (!latest) {
        return [
          "Explain binary search trees",
          "How does dynamic programming work?",
          "What are design patterns?",
          "Explain Big O notation",
          "Difference between stack and queue?",
          "How do hash tables work?",
        ]
      }

      const company = latest.summary?.company || latest.parsed?.company || "the company"
      const role = latest.summary?.position || latest.parsed?.position || "the role"

      const fromQuestions: string[] = []
      const cats = latest.questions?.categories || []
      for (const c of cats) {
        for (const q of c.questions?.slice(0, 2) || []) {
          if (q?.question) fromQuestions.push(q.question)
        }
        if (fromQuestions.length >= 6) break
      }
      // Merge in questions explicitly extracted from the email
      const emailQs: string[] = Array.isArray(latest.parsed?.extracted_questions) ? latest.parsed.extracted_questions.slice(0,4) : []
      fromQuestions.unshift(...emailQs)

      const tailored: string[] = [
        `What are common interview topics at ${company} for ${role}?`,
        `How should I prepare for ${company}'s ${latest.parsed?.interview_type || "Technical"} round?`,
        `What system design patterns does ${company} care about?`,
        `Any ${company}-specific behavioral questions to expect?`,
      ]

      const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)))
      return uniq([...fromQuestions, ...tailored]).slice(0, 8)
    } catch {
      return [
        "Explain binary search trees",
        "How does dynamic programming work?",
        "What are design patterns?",
        "Explain Big O notation",
        "Difference between stack and queue?",
        "How do hash tables work?",
      ]
    }
  }, [])

  const ask = (q: string) => {
    const event = new CustomEvent("ask-question", { detail: q })
    window.dispatchEvent(event)
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {suggestions.map((q, idx) => (
        <Button
          key={`${idx}-${q}`}
          variant="outline"
          className="justify-start text-left h-auto py-3 px-4 bg-transparent rounded-xl hover:bg-muted/50"
          onClick={() => ask(q)}
        >
          <span className="text-sm leading-relaxed">{q}</span>
        </Button>
      ))}
    </div>
  )
}
