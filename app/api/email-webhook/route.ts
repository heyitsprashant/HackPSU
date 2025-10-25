import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Extract email content from different email service formats
    // This supports SendGrid, Mailgun, AWS SES, and custom formats
    const emailContent =
      body.text || // SendGrid
      body["body-plain"] || // Mailgun
      body.content?.text || // AWS SES
      body.email || // Custom format
      ""

    const toEmail = body.to || body.recipient || ""

    console.log("[v0] Received email webhook:", { toEmail, hasContent: !!emailContent })

    if (!emailContent) {
      return NextResponse.json({ error: "No email content found" }, { status: 400 })
    }

    // Extract user identifier from email address (interviews+userid@mentorverse.app)
    const userMatch = toEmail.match(/interviews\+([^@]+)@/)
    const userId = userMatch ? userMatch[1] : null

    console.log("[v0] Extracted user ID:", userId)

    // Parse email with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `You are an AI assistant that extracts interview information from emails.

Analyze the following email and extract any interview-related information:

${emailContent}

Extract the following information if available:
- Company name
- Position/role
- Interview date (format as YYYY-MM-DD)
- Interview type (technical, behavioral, system-design, coding, or phone-screen)

Return ONLY a valid JSON object in this exact format:
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

If no interview information is found, return: {"interviews": []}`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    console.log("[v0] Gemini response:", response)

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse interview data" }, { status: 400 })
    }

    const data = JSON.parse(jsonMatch[0])

    // Store interviews (in a real app, this would save to a database with userId)
    // For now, we'll return the data and let the client handle it
    console.log("[v0] Parsed interviews:", data.interviews)

    return NextResponse.json({
      success: true,
      userId,
      interviews: data.interviews,
      message: `Successfully parsed ${data.interviews.length} interview(s)`,
    })
  } catch (error) {
    console.error("[v0] Email webhook error:", error)
    return NextResponse.json({ error: "Failed to process email" }, { status: 500 })
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: "Email webhook endpoint is active",
    instructions: {
      setup: "Configure your email service to forward emails to this webhook",
      supportedServices: ["SendGrid Inbound Parse", "Mailgun Routes", "AWS SES", "Custom"],
      endpoint: "/api/email-webhook",
      method: "POST",
    },
  })
}
