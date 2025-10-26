import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: NextRequest) {
  try {
    const { mode, constraints } = await req.json()

    // If seedQuestions are provided (e.g., extracted from email), synthesize a minimal questions payload without LLM
    if (constraints?.seedQuestions && Array.isArray(constraints.seedQuestions) && constraints.seedQuestions.length > 0) {
      const questions = constraints.seedQuestions.slice(0, 8).map((q: string, i: number) => ({
        id: `seed-${i+1}`,
        title: q.substring(0, 60),
        prompt: q,
        difficulty: constraints.experience_level?.toLowerCase()?.includes('senior') ? 'hard' : 'medium',
      }))
      return NextResponse.json({ questions })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompts: Record<string, string> = {
      quick: `You are an interview generator. Produce 2–3 coding problems for a 30-minute
screen. Target difficulty: easy→medium. Each problem must include:
- Title, concise prompt, example I/O, constraints, and 3–5 test cases.
- Topics should vary (arrays/strings, hash maps, BFS/DFS, two pointers).
- Output JSON: {questions:[{id,title,prompt,examples:[{in,out}],constraints,tests:[{in,out}],difficulty}]}
Keep solutions internal; do not reveal them.`,
      full: `Produce 3–4 problems: 2 medium, 1 medium-hard, 1 optional easy warm-up.
Diversity across DP/graphs/greedy/strings. Same JSON shape as quick, add
"followUps" with 2 deeper variations per question.`,
      behavioral: `Generate 6 behavioral questions tailored for SWE internships/new grads.
Tag each with a competency: ownership, teamwork, conflict, leadership,
customer focus, learning. JSON: {questions:[{id,prompt,competency}]}.`,
      system: `Generate 1–2 system design prompts at entry-level: "Design URL shortener",
"Design real-time chat", etc. Provide requirements, non-functional goals,
and hints. JSON: {questions:[{id,title,prompt,requirements:[...],constraints:[...]}]}`,
    }

    const prompt = prompts[mode as string] + (constraints ? `\n\nConstraints: ${JSON.stringify(constraints)}` : "")
    const result = await model.generateContent(prompt)
    const txt = result.response.text()

    // Try to extract JSON
    const match = txt.match(/\{[\s\S]*\}$/)
    if (match) {
      return NextResponse.json(JSON.parse(match[0]))
    }
    // Fallback
    return NextResponse.json({ questions: [] })
  } catch (e) {
    return NextResponse.json({ questions: [] }, { status: 200 })
  }
}
