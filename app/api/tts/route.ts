import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Use OpenRouter API key for TTS via OpenAI's TTS endpoint
    const apiKey = process.env.OPENROUTER_API_KEY || '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'
    
    // OpenRouter routes to OpenAI TTS
    const response = await fetch('https://openrouter.ai/api/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Interview Practice Platform'
      },
      body: JSON.stringify({
        model: 'openai/tts-1',
        input: text,
        voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
        response_format: 'mp3',
        speed: 1.0,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenRouter TTS API error:', error)
      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: response.status }
      )
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()

    // Return audio as response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })

  } catch (error: any) {
    console.error('TTS route error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
