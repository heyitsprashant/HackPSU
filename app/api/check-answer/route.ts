import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBCrtjNEDq9T_iXe9Y10anLMINyKsaiBPA"
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(req: Request) {
  try {
    const { question, userAnswer, correctAnswer } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const rubric = correctAnswer
      ? `Expected Approach: ${correctAnswer}`
      : `If no canonical solution provided, first derive a concise expected approach (in your head), then grade.`

    const prompt = `You are evaluating a technical interview answer.

Question: ${question}

${rubric}

User's Answer: ${userAnswer}

Evaluate if the user's answer demonstrates:
1. Correct understanding of the problem and key constraints
2. A valid algorithm or design that solves the problem
3. Reasonable time/space complexity for the expected difficulty

Return ONLY JSON (no markdown):
{
  "isCorrect": true|false,
  "feedback": "1-3 sentences on why",
  "improvements": ["actionable tip 1", "actionable tip 2"]
}`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    console.log("[v0] Answer check response:", text)

    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()
    const evaluation = JSON.parse(cleanedText)

    return Response.json(evaluation)
  } catch (error) {
    console.error("[v0] Error checking answer:", error)
    return Response.json({ error: "Failed to check answer" }, { status: 500 })
  }
}
