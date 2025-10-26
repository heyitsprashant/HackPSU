import { GoogleGenerativeAI } from "@google/generative-ai"

export const maxDuration = 30

const geminiKey = process.env.GEMINI_API_KEY
const openrouterKey = process.env.OPENROUTER_API_KEY

if (!geminiKey && !openrouterKey) {
  throw new Error("GEMINI_API_KEY or OPENROUTER_API_KEY is required")
}

const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null

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

    // Try Gemini first, fallback to OpenRouter
    if (genAI) {
      try {
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
      } catch (geminiError: any) {
        console.warn("[v0] Gemini failed, trying OpenRouter:", geminiError.message)
        // Fall through to OpenRouter
      }
    }

    // OpenRouter fallback
    if (openrouterKey) {
      const openrouterMessages = [
        { role: "system", content: systemPrompt },
        ...messages
      ]

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://hackpsu-interview-prep.vercel.app",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: openrouterMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.statusText}`)
      }

      // Transform OpenRouter stream to plain text
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const reader = response.body?.getReader()
            if (!reader) throw new Error("No response body")

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'))

              for (const line of lines) {
                const data = line.replace('data: ', '').trim()
                if (data === '[DONE]') continue
                
                try {
                  const json = JSON.parse(data)
                  const text = json.choices?.[0]?.delta?.content || ''
                  if (text) {
                    controller.enqueue(encoder.encode(text))
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
            controller.close()
          } catch (error) {
            console.error("[v0] OpenRouter stream error:", error)
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
    }

    throw new Error("No AI provider available")
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return Response.json({ error: "Failed to process chat" }, { status: 500 })
  }
}
