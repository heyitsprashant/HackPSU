import { NextRequest } from "next/server"

// Streams ElevenLabs TTS. Requires ELEVENLABS_API_KEY in env.
// Request body: { text: string, voiceId?: string, voiceSettings?: { stability?: number, similarity_boost?: number } }
export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, voiceSettings } = await req.json()
    if (!text || typeof text !== 'string') return new Response(JSON.stringify({ error: 'text required' }), { status: 400 })

    const apiKey = process.env.ELEVENLABS_API_KEY || ''
    if (!apiKey) return new Response(JSON.stringify({ error: 'TTS not configured' }), { status: 500 })

    const VOICE_MAP: Record<string,string> = { rachel:'21m00Tcm4TlvDq8ikWAM', bella:'EXAVITQu4vr4xnSDxMaL', adam:'pNInz6obpgDQGcFmaJgB' }
    const vid = (voiceId && voiceId.length>20) ? voiceId : (VOICE_MAP[(voiceId||'rachel').toLowerCase()] || VOICE_MAP.rachel)
    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(vid)}/stream?optimize_streaming_latency=3`

    const payload = {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: voiceSettings || { stability: 0.5, similarity_boost: 0.75 },
    }

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'accept': 'audio/mpeg',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!resp.ok || !resp.body) {
      const t = await resp.text()
      return new Response(JSON.stringify({ error: `elevenlabs ${resp.status}: ${t}` }), { status: 502 })
    }

    return new Response(resp.body, { headers: { 'Content-Type': 'audio/mpeg' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'tts failed' }), { status: 500 })
  }
}
