import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBCrtjNEDq9T_iXe9Y10anLMINyKsaiBPA"
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(req: Request) {
  try {
    const { question, topic, mode } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    let prompt = ""

    switch (mode) {
      case "teach":
        prompt = `You are a patient CS tutor. Explain the solution to this problem step-by-step:

${question}

Topic: ${topic}

Provide:
1. The key concept needed
2. Step-by-step solution approach
3. Code example with comments
4. Time and space complexity

Keep it clear and encouraging for neurodivergent learners.`
        break

      case "visual":
        prompt = `Explain the solution to this problem using visual descriptions and ASCII diagrams:

${question}

Topic: ${topic}

Use:
- ASCII art to show data structures
- Step-by-step visual walkthrough
- Clear visual metaphors
- Diagrams showing algorithm flow

Make it highly visual and easy to understand.`
        break

      case "audio":
        prompt = `Create an audio-friendly explanation (text that will be read aloud) for this problem:

${question}

Topic: ${topic}

Write in a conversational, spoken style:
- Use simple, clear language
- Avoid complex symbols
- Spell out code concepts verbally
- Use pauses (indicated by periods)
- Keep sentences short and clear

This will be read by text-to-speech, so make it natural to listen to.`
        break

      case "theory":
        prompt = `Provide a comprehensive theoretical explanation for this problem:

${question}

Topic: ${topic}

Include:
1. Underlying computer science theory
2. Related algorithms and data structures
3. Mathematical analysis
4. Common patterns and variations
5. Real-world applications

Be thorough and academic while remaining accessible.`
        break
    }

    const result = await model.generateContent(prompt)
    const response = result.response
    const explanation = response.text()

    console.log("[v0] Explanation generated for mode:", mode)

    return Response.json({ explanation })
  } catch (error) {
    console.error("[v0] Error generating explanation:", error)
    return Response.json({ error: "Failed to generate explanation" }, { status: 500 })
  }
}
