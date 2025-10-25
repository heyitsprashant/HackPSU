import { GoogleGenerativeAI } from "@google/generative-ai"

export const maxDuration = 30

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBCrtjNEDq9T_iXe9Y10anLMINyKsaiBPA"
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Extract interview context from messages
    const firstMessage = messages[0]?.content || ""
    const hasInterviewContext = firstMessage.includes("[User has upcoming interviews")

    // Build system prompt
    const systemPrompt = hasInterviewContext
      ? `You are an expert CS mentor and interview coach. The user has shared their upcoming interviews with you. 
         When relevant, provide company-specific advice, common interview patterns for those companies, 
         and tailored preparation strategies. Focus on practical, actionable guidance.
         Be encouraging and supportive, especially for neurodivergent learners.`
      : `You are an expert CS mentor specializing in helping students learn computer science concepts 
         and prepare for technical interviews. Provide clear, detailed explanations with examples.
         Be encouraging and supportive, especially for neurodivergent learners.`

    // Get Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemPrompt,
    })

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    const lastMessage = messages[messages.length - 1]?.content || ""

    // Start chat with history
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    })

    // Stream the response
    const result = await chat.sendMessageStream(lastMessage)

    // Create a readable stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            controller.enqueue(encoder.encode(text))
          }
          controller.close()
        } catch (error) {
          console.error("[v0] Chat stream error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return Response.json({ error: "Failed to process chat" }, { status: 500 })
  }
}
