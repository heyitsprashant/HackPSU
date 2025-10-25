import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBCrtjNEDq9T_iXe9Y10anLMINyKsaiBPA"
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(req: Request) {
  const { emailContent } = await req.json()

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `You are an AI assistant that extracts interview information from emails. 

Analyze the following email and extract:
1. Company name
2. Position/role
3. Interview date (in YYYY-MM-DD format)
4. Interview type (choose from: technical, behavioral, system-design, coding, phone-screen)

If multiple interviews are mentioned, extract all of them.

Email content:
${emailContent}

Respond ONLY with a valid JSON object in this exact format:
{
  "interviews": [
    {
      "company": "Company Name",
      "position": "Position Title",
      "date": "YYYY-MM-DD",
      "type": "technical"
    }
  ]
}

If you cannot find clear interview information, return:
{
  "interviews": []
}`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    console.log("[v0] Email parse response:", text)

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return Response.json(parsed)
      }
    } catch (e) {
      console.error("[v0] Failed to parse JSON:", e)
    }

    return Response.json({ interviews: [] })
  } catch (error) {
    console.error("[v0] Error parsing email:", error)
    return Response.json({ interviews: [], error: "Failed to parse email" }, { status: 500 })
  }
}
