import React, { useEffect, useState } from "react"

function readCache() {
  if (typeof window === 'undefined') return [] as { prompt: string; dataUrl: string }[]
  try { return JSON.parse(localStorage.getItem('mv.visualCache') || '[]') } catch { return [] }
}
function writeCache(items: { prompt: string; dataUrl: string }[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('mv.visualCache', JSON.stringify(items.slice(0,3)))
}

export function VisualDisplay({ prompt }: { prompt: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!prompt) return
    const cache = readCache()
    const hit = cache.find(c => c.prompt === prompt)
    if (hit) { setDataUrl(hit.dataUrl); return }
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/gemini/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, visual_prompt: prompt }) })
        const j = await res.json()
        if (j?.dataUrl) {
          setDataUrl(j.dataUrl)
          const items = [{ prompt, dataUrl: j.dataUrl }, ...readCache()].filter((v,i,a)=> a.findIndex(x=>x.prompt===v.prompt)===i)
          writeCache(items)
        }
      } finally { setLoading(false) }
    })()
  }, [prompt])

  if (loading) return <div className="h-56 rounded-xl bg-muted/30 animate-pulse" />
  if (!dataUrl) return null
  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <img src={dataUrl} alt="AI generated visual" className="w-full rounded-xl border shadow-sm" />
    </div>
  )
}
