import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// OpenRouter API key for Whisper transcription
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const audio = form.get("audio") as File | null
    const frame = form.get("frame") as File | null
    const sessionId = String(form.get("sessionId") || "")
    const transcript = String(form.get("transcript") || "")

    console.log('🎥 [Behavioral Stream] Starting analysis...', {
      hasFrame: !!frame,
      hasAudio: !!audio,
      sessionId,
      transcriptLength: transcript.length
    })

    if (!frame) {
      console.error('❌ [Behavioral Stream] No frame provided')
      return NextResponse.json({ error: "Frame required" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('❌ [Behavioral Stream] GEMINI_API_KEY not configured')
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 })
    }
    
    console.log('✅ [Behavioral Stream] API key found, initializing Gemini...')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    // Transcribe audio using OpenRouter Whisper API
    let audioTranscript = ""
    if (audio && OPENROUTER_API_KEY) {
      try {
        console.log('🎤 [Behavioral Stream] Transcribing audio with OpenRouter Whisper...')
        
        // Convert audio to base64 for OpenRouter API
        const audioBuffer = Buffer.from(await audio.arrayBuffer())
        const audioBase64 = audioBuffer.toString('base64')
        
        // Call OpenRouter's Whisper endpoint
        const whisperResponse = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'whisper-1',
            file: audioBase64,
            language: 'en',
          }),
        })
        
        if (whisperResponse.ok) {
          const whisperData = await whisperResponse.json()
          audioTranscript = whisperData.text || ""
          console.log('✅ [Behavioral Stream] Whisper transcription:', audioTranscript.substring(0, 100) + '...')
        } else {
          const errorText = await whisperResponse.text()
          console.warn('⚠️ [Behavioral Stream] OpenRouter Whisper failed:', errorText)
        }
      } catch (whisperError: any) {
        console.warn('⚠️ [Behavioral Stream] Whisper transcription error:', whisperError.message)
      }
    } else if (audio && !OPENROUTER_API_KEY) {
      console.warn('⚠️ [Behavioral Stream] OPENROUTER_API_KEY not configured, skipping transcription')
    }

    const parts: any[] = []
    const frameBuffer = Buffer.from(await frame.arrayBuffer())
    parts.push({
      inlineData: {
        data: frameBuffer.toString("base64"),
        mimeType: frame.type || "image/jpeg",
      },
    })

    // Note: We don't send audio to Gemini anymore, we use Whisper for transcription

    const prompt = `You are an expert behavioral interview coach with deep expertise in body language, communication, and professional presentation analysis.

ANALYZE THE LIVE VIDEO FRAME:

1. EYE CONTACT (0-100):
   - Is the person looking directly at the camera (simulating interviewer eye contact)?
   - Measure: Consistent gaze direction, no excessive looking away
   - High score: Direct, steady camera gaze; Low score: Looking down/away frequently

2. FACIAL EXPRESSIONS (0-100):
   - Are expressions natural, confident, and appropriate?
   - Measure: Genuine smiles, engaged expressions, no signs of stress
   - High score: Warm, professional demeanor; Low score: Blank stare, excessive nervousness

3. BODY POSTURE (0-100 - under engagement):
   - Is posture upright, centered in frame, professional?
   - Measure: Shoulders back, sitting straight, proper framing
   - High score: Professional positioning; Low score: Slouching, off-center

4. SPEECH CLARITY (0-100) ${audioTranscript ? '- AUDIO TRANSCRIBED' : '- NO AUDIO, estimate from visual cues'}:
   ${audioTranscript ? `- Analyze clarity based on transcription: "${audioTranscript.substring(0, 200)}"` : '- Estimate based on mouth movements, facial tension, breathing patterns'}
   - Measure: Clear pronunciation, appropriate pace, good volume
   - High score: Clear, well-paced speech; Low score: Mumbling, too fast/slow

5. TONE CONFIDENCE (0-100):
   ${audioTranscript ? '- Infer confidence from transcription word choice and structure' : '- Estimate from facial confidence, posture, and body language'}
   - Measure: Vocal strength, steady delivery, minimal hesitation
   - High score: Confident tone; Low score: Uncertain, shaky voice

6. EMOTIONAL STABILITY (0-100):
   - Observe composure, calmness under pressure, emotional control
   - Measure: Steady expressions, controlled movements, no visible anxiety
   - High score: Calm and composed; Low score: Visible stress, fidgeting

IMPORTANT SCORING GUIDELINES:
- Be realistic: Most candidates score 60-80, not 90+
- 90-100: Exceptional, professional interview presence
- 70-89: Good, solid performance with minor areas for improvement
- 50-69: Average, noticeable areas needing work
- 30-49: Below average, significant improvement needed
- 0-29: Poor, major issues present

Return ONLY valid JSON (no markdown, no explanation):
{
  "metrics": {
    "speechClarity": <number 0-100>,
    "toneConfidence": <number 0-100>,
    "emotionalStability": <number 0-100>,
    "eyeContact": <number 0-100>,
    "expressions": <number 0-100>,
    "engagement": <number 0-100>
  },
  "observations": "2-3 sentence summary of what you observe",
  "topStrength": "one key strength",
  "topWeakness": "one area to improve"
}${transcript || audioTranscript ? `\n\nCONTEXT - Transcript: "${(audioTranscript || transcript).slice(-300)}"` : ""}

    parts.unshift({ text: prompt })

    console.log('🤖 [Behavioral Stream] Calling Gemini AI...')
    const result = await model.generateContent(parts)
    console.log('✅ [Behavioral Stream] Gemini response received')
    
    let text = result.response.text() || "{}"
    console.log('📝 [Behavioral Stream] Raw response:', text.substring(0, 200) + '...')
    
    text = text.trim()
    if (text.startsWith('```json')) text = text.slice(7)
    if (text.startsWith('```')) text = text.slice(3)
    if (text.endsWith('```')) text = text.slice(0, -3)
    text = text.trim()

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('❌ [Behavioral Stream] No JSON found in response:', text)
      throw new Error('Invalid response format from AI')
    }
    
    let data = JSON.parse(match[0])
    console.log('📊 [Behavioral Stream] Parsed metrics:', data.metrics)
    
    // Ensure all metrics exist with fallback values
    if (!data.metrics) {
      data.metrics = {}
    }
    
    // Validate and normalize metrics (ensure they're numbers 0-100)
    const normalizeMetric = (value: any): number => {
      const num = typeof value === 'number' ? value : parseFloat(value) || 0
      return Math.max(0, Math.min(100, num))
    }
    
    data.metrics = {
      speechClarity: normalizeMetric(data.metrics.speechClarity),
      toneConfidence: normalizeMetric(data.metrics.toneConfidence),
      emotionalStability: normalizeMetric(data.metrics.emotionalStability),
      eyeContact: normalizeMetric(data.metrics.eyeContact),
      expressions: normalizeMetric(data.metrics.expressions),
      engagement: normalizeMetric(data.metrics.engagement)
    }
    
    // Include observations for UI feedback
    data.observations = data.observations || ""
    data.topStrength = data.topStrength || ""
    data.topWeakness = data.topWeakness || ""
    
    // Add the Whisper-transcribed text to the response
    if (audioTranscript) {
      data.transcript = audioTranscript
    }
    
    console.log('✅ [Behavioral Stream] Analysis complete:', {
      avgScore: Object.values(data.metrics).reduce((a: number, b: number) => a + b, 0) / 6,
      hasObservations: !!data.observations,
      hasStrength: !!data.topStrength,
      hasWeakness: !!data.topWeakness,
      transcriptLength: audioTranscript.length
    })

    return NextResponse.json({ ok: true, data, sessionId })
  } catch (e: any) {
    console.error('❌ [Behavioral Stream] Error:', e.message)
    console.error('📋 [Behavioral Stream] Stack:', e.stack)
    
    // Return error instead of fake data so we know something is wrong
    return NextResponse.json({ 
      ok: false,
      error: e.message,
      data: { 
        metrics: {
          speechClarity: 0,
          toneConfidence: 0,
          emotionalStability: 0,
          eyeContact: 0,
          expressions: 0,
          engagement: 0
        },
        transcript: "",
        observations: "Error: Unable to analyze. Check console logs.",
        topStrength: "",
        topWeakness: ""
      },
      sessionId: ""
    })
  }
}
