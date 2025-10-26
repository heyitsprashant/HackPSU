"use client"

import React, { useState } from "react"

export function AudioPlayer({ text, voiceId }: { text: string; voiceId?: string }) {
  const [playing, setPlaying] = useState(false)

  async function play() {
    if (!text) return
    try {
      const res = await fetch('/api/voice/speak', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voiceId }) })
      if (!res.ok) {
        try { const err = await res.json(); console.warn('TTS error:', err) } catch {}
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      setPlaying(true)
      audio.onended = () => setPlaying(false)
      audio.play()
    } catch {}
  }

  return (
    <button onClick={play} className={`rounded-full px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition ${playing ? 'animate-pulse bg-blue-500/80' : ''}`}>
      🔊 Listen Explanation
    </button>
  )
}
