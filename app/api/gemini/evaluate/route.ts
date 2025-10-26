import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  // This is a minimal stub that echoes a simple evaluation JSON.
  // Replace with real Gemini Computer Use evaluation in production.
  const { mode, payload } = await req.json()
  const score = 0
  const res = { score, feedback: `Evaluation placeholder for ${mode}`, perTest: [], complexity: { time: "-", space: "-" } }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(JSON.stringify(res)))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "application/json" },
  })
}
