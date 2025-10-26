import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest){
  try{
    const { transcript, metrics, question } = await req.json()
    if (!transcript && !metrics) return NextResponse.json({ error: 'Missing transcript/metrics' }, { status: 400 })

    const geminiKey = process.env.GEMINI_API_KEY
    const eleven = process.env.ELEVENLABS_API_KEY

    let text = ''
    if (geminiKey) {
      const { GoogleGenerativeAI } = await import("@google/generative-ai")
      const genAI = new GoogleGenerativeAI(geminiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
      
      const prompt = `You are a supportive interview coach. Analyze this live snippet:

Question: ${question || "N/A"}
Transcript: ${transcript?.slice(0, 1000) || "(no audio yet)"}
Metrics (0-100): Eye contact=${metrics?.eyeContact || 0}, Speech=${metrics?.speechClarity || 0}, Confidence=${metrics?.toneConfidence || 0}, Engagement=${metrics?.engagement || 0}

Provide brief, encouraging feedback in 3 sections:
1. What's working well (2 specific things)
2. Quick improvements (2 actionable tips)
3. Example phrases they could use

Keep response under 150 words, friendly tone.`

      const result = await model.generateContent(prompt)
      text = result.response.text() || ''
    } else {
      text = 'Real-time coaching unavailable (configure GEMINI_API_KEY)'
    }

    // Optional TTS via ElevenLabs
    let audio: string | undefined
    if (eleven && text){
      const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
      const tts = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method:'POST',
        headers:{
          'xi-api-key': eleven,
          'Content-Type':'application/json'
        },
        body: JSON.stringify({ text, model_id: 'eleven_turbo_v2', voice_settings: { stability:0.4, similarity_boost:0.7 } })
      })
      const buf = Buffer.from(await tts.arrayBuffer())
      audio = `data:audio/mpeg;base64,${buf.toString('base64')}`
    }

    return NextResponse.json({ text, audio })
  }catch(e:any){
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}