import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBCrtjNEDq9T_iXe9Y10anLMINyKsaiBPA"
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(req: Request) {
  try {
    const { company, position, difficulty } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Generate a ${difficulty} level Data Structures and Algorithms question suitable for a ${position} interview at ${company}.

The question should:
- Be relevant to ${company}'s interview style
- Match ${difficulty} difficulty level
- Include a clear problem statement
- Be solvable in 15-30 minutes

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "id": "unique-id",
  "question": "detailed problem statement",
  "difficulty": "${difficulty}",
  "topic": "specific topic like 'Arrays', 'Trees', 'Dynamic Programming', etc.",
  "hints": ["hint 1", "hint 2", "hint 3"],
  "correctAnswer": "brief description of the correct approach"
}`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    console.log("[v0] DSA question response:", text)

    // Parse the JSON response
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()
    const question = JSON.parse(cleanedText)

    return Response.json({ question })
  } catch (error) {
    console.error("[v0] Error generating DSA question:", error)
    return Response.json({ error: "Failed to generate question" }, { status: 500 })
  }
}
