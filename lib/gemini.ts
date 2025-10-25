import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBCrtjNEDq9T_iXe9Y10anLMINyKsaiBPA"
export const genAI = new GoogleGenerativeAI(apiKey)

// Get the Gemini 2.0 Flash model
export function getGeminiModel() {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
}

// Helper to stream text responses
export async function streamGeminiResponse(prompt: string, systemInstruction?: string) {
  const model = getGeminiModel()

  const chat = model.startChat({
    history: [],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
    },
  })

  if (systemInstruction) {
    await chat.sendMessage(systemInstruction)
  }

  const result = await chat.sendMessageStream(prompt)
  return result.stream
}
