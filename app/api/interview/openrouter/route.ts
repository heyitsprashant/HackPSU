import { NextRequest, NextResponse } from "next/server"

// Next.js API route that talks directly to OpenRouter for:
// - Gemini 2.5 evaluation (JSON)
// - Optional image generation (base64)
// - Optional ElevenLabs TTS (base64)
// Requires: OPENROUTER_API_KEY in env (frontend server side)

const ORIGIN = process.env.SITE_URL || "http://localhost:3000"
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ""

function orHeaders() {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY missing")
  return {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": ORIGIN,
    "X-Title": "MentorVerse AI Interview Coach",
  }
}

export async function POST(req: NextRequest) {
  try {
    const { question, answer, visual = false, audio = false, voice = "Rachel" } = await req.json()
    if (!question || !answer) return NextResponse.json({ error: "question/answer required" }, { status: 400 })

    // 1) Gemini 2.5 evaluation (JSON-only)
    const evalPrompt = `You are an AI interview coach analyzing a user's short answer.\n\nQuestion: ${question}\nUser Answer: ${answer}\n\nRespond in this JSON format ONLY:\n{\n  "evaluation": {"score": 0-100, "verdict": "Excellent|Almost|Not quite"},\n  "summary": "One sentence summary of performance",\n  "visual_prompt": "short description of what image to generate",\n  "explanation": "Detailed friendly explanation like a tutor",\n  "theory": "Extra technical detail or deeper concept explanation"\n}`

    const chatRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: orHeaders(),
      body: JSON.stringify({
        model: "google/gemini-2.5-pro-exp-02-05:free",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: evalPrompt }],
      }),
    })
    if (!chatRes.ok) {
      const t = await chatRes.text()
      return NextResponse.json({ error: `gemini: ${chatRes.status} ${t}` }, { status: 502 })
    }
    const chatJson = await chatRes.json()
    const content = chatJson?.choices?.[0]?.message?.content || "{}"
    let ai: any
    try { ai = JSON.parse(content) } catch { ai = { error: "Invalid JSON", raw: content } }

    // 2) Optional image
    let image: string | null = null
    if (visual && ai?.visual_prompt) {
      const imgRes = await fetch("https://openrouter.ai/api/v1/images/generations", {
        method: "POST",
        headers: orHeaders(),
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          input: `Draw a clean educational diagram for: ${ai.visual_prompt}`,
          image: { size: "1024x768" },
        }),
      })
      if (imgRes.ok) {
        const j = await imgRes.json()
        image = j?.data?.[0]?.b64_json || null
      }
    }

    // 3) Optional audio
    let audioB64: string | null = null
    if (audio && ai?.explanation) {
      const ttsRes = await fetch("https://openrouter.ai/api/v1/audio/speech", {
        method: "POST",
        headers: orHeaders(),
        body: JSON.stringify({
          model: "elevenlabs/eleven-multilingual-v2",
          input: ai.explanation,
          voice: voice || "Rachel",
          format: "base64",
        }),
      })
      if (ttsRes.ok) {
        const j = await ttsRes.json()
        audioB64 = j?.data?.[0]?.b64_audio || null
      }
    }

    return NextResponse.json({ ai, image, audio: audioB64 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "openrouter route failed" }, { status: 500 })
  }
}
