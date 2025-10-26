"use client"

import React from "react"
import { Volume2, VolumeX, Loader2 } from "lucide-react"
import { useTextToSpeech } from "@/hooks/useTextToSpeech"
import { Button } from "@/components/ui/button"

export function AIResponseCard({ verdict, text }: { verdict: 'correct'|'wrong'|'info'; text: string }) {
  const color = verdict === 'correct' ? 'border-l-4 border-green-500' : verdict === 'wrong' ? 'border-l-4 border-amber-500' : 'border-l-4 border-blue-500'
  const ariaLabel = verdict === 'correct' ? 'Correct answer feedback' : verdict === 'wrong' ? 'Incorrect answer feedback' : 'Information'
  
  const { isPlaying, isLoading, error, speak, pause, resume, stop } = useTextToSpeech()

  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
    } else if (isLoading) {
      stop()
    } else {
      speak(text)
    }
  }
  
  // Convert markdown-style formatting to HTML with enhanced structure
  const formatText = (rawText: string) => {
    let formatted = rawText
      // Code blocks with triple backticks (must be done first)
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto"><code>$1</code></pre>')
      // Headers: ### Header (with better spacing)
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100" role="heading" aria-level="3">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100" role="heading" aria-level="2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100" role="heading" aria-level="1">$1</h1>')
      // Bold: **text** or __text__
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
      .replace(/__([^_]+)__/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
      // Italic: *text* or _text_
      .replace(/\*([^*]+)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')
      .replace(/_([^_]+)_/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')
      // Inline code: `code`
      .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100">$1</code>')
      // Bullet points: - item or * item
      .replace(/^[•\-\*] (.+)$/gm, '<li class="ml-6 mb-2 text-gray-700 dark:text-gray-300">$1</li>')
      // Numbered lists: 1. item
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 mb-2 text-gray-700 dark:text-gray-300">$1</li>')
    
    // Wrap consecutive <li> elements in <ul> or <ol>
    formatted = formatted.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, (match) => {
      return `<ul class="list-disc space-y-1 my-4 ml-2" role="list">${match}</ul>`
    })
    
    // Line breaks - preserve paragraph structure
    formatted = formatted
      .replace(/\n\n+/g, '</p><p class="my-3 text-gray-700 dark:text-gray-300 leading-relaxed">')
      .replace(/\n/g, '<br/>')
    
    // Wrap in paragraph tags if not already wrapped
    if (!formatted.startsWith('<')) {
      formatted = `<p class="my-3 text-gray-700 dark:text-gray-300 leading-relaxed">${formatted}</p>`
    }
    
    return formatted
  }

  return (
    <div 
      className={`bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-sm p-6 ${color} relative`}
      role="region"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {/* Text-to-Speech Button */}
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePlayPause}
          disabled={isLoading}
          className="h-9 w-9"
          aria-label={isPlaying ? 'Pause speech' : 'Play speech'}
          title={isPlaying ? 'Pause speech' : 'Play speech'}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="max-w-none pr-12">
        <div 
          dangerouslySetInnerHTML={{ __html: formatText(text) }} 
          className="text-base leading-relaxed formatted-content"
          style={{
            fontSize: '16px',
            lineHeight: '1.75',
          }}
        />
      </div>
      <style jsx>{`
        .formatted-content :global(ul) {
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .formatted-content :global(pre) {
          font-family: 'Courier New', monospace;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .formatted-content :global(h1),
        .formatted-content :global(h2),
        .formatted-content :global(h3) {
          line-height: 1.4;
        }
        .formatted-content :global(p:first-child) {
          margin-top: 0;
        }
        .formatted-content :global(p:last-child) {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  )
}
