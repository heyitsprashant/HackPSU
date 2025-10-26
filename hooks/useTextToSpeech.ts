import { useState, useRef, useCallback, useEffect } from 'react'

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Clean up markdown formatting for TTS
  const cleanTextForSpeech = (text: string): string => {
    return text
      // Remove markdown bold/italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove markdown headers
      .replace(/^#{1,6}\s+(.+)$/gm, '$1')
      // Remove code blocks
      .replace(/`([^`]+)`/g, '$1')
      // Remove bullet points and numbers
      .replace(/^[•\-\*]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // Clean up extra whitespace
      .replace(/\n\n+/g, '. ')
      .replace(/\n/g, ' ')
      .trim()
  }

  const speak = useCallback(async (text: string) => {
    try {
      // Stop any currently playing audio
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      setIsLoading(true)
      setError(null)

      const cleanText = cleanTextForSpeech(text)

      // Try using OpenRouter API for high-quality TTS
      try {
        abortControllerRef.current = new AbortController()
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: cleanText }),
          signal: abortControllerRef.current.signal,
        })

        if (response.ok) {
          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          
          const audio = new Audio(audioUrl)
          audioRef.current = audio

          audio.onplay = () => {
            setIsPlaying(true)
            setIsLoading(false)
          }

          audio.onended = () => {
            setIsPlaying(false)
            URL.revokeObjectURL(audioUrl)
            audioRef.current = null
          }

          audio.onerror = () => {
            setError('Failed to play audio')
            setIsPlaying(false)
            setIsLoading(false)
            URL.revokeObjectURL(audioUrl)
            audioRef.current = null
          }

          await audio.play()
          return
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return
        }
        console.warn('OpenRouter TTS failed, falling back to browser TTS:', err)
      }

      // Fallback to Web Speech API (browser native)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utteranceRef.current = utterance

        // Configure voice settings
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 1.0

        // Get voices and set a preferred one
        const voices = window.speechSynthesis.getVoices()
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'))
        if (englishVoice) {
          utterance.voice = englishVoice
        }

        utterance.onstart = () => {
          setIsPlaying(true)
          setIsLoading(false)
        }

        utterance.onend = () => {
          setIsPlaying(false)
          utteranceRef.current = null
        }

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event)
          setError('Failed to play speech')
          setIsPlaying(false)
          setIsLoading(false)
          utteranceRef.current = null
        }

        window.speechSynthesis.speak(utterance)
      } else {
        throw new Error('Text-to-speech not supported in this browser')
      }

    } catch (err: any) {
      console.error('Text-to-speech error:', err)
      setError(err.message || 'Failed to generate speech')
      setIsPlaying(false)
      setIsLoading(false)
    }
  }, [])

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause()
        setIsPlaying(false)
      }
    }
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
        setIsPlaying(true)
      }
    }
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsPlaying(false)
    setIsLoading(false)
    utteranceRef.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  return {
    isPlaying,
    isLoading,
    error,
    speak,
    pause,
    resume,
    stop,
  }
}
