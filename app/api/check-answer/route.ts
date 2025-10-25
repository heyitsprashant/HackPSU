import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBCrtjNEDq9T_iXe9Y10anLMINyKsaiBPA"
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(req: Request) {
  try {
    const { question, userAnswer, correctAnswer } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `You are evaluating a coding interview answer.

Question: ${question}

Expected Approach: ${correctAnswer}

User's Answer: ${userAnswer}

Evaluate if the user's answer demonstrates:
1. Correct understanding of the problem
2. Valid algorithmic approach
3. Reasonable time/space complexity

Return ONLY a JSON object (no markdown, no code blocks):
{
  "isCorrect": true or false,
  "feedback": "brief explanation"
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
