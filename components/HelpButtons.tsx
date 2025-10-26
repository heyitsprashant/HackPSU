import React from "react"

export function HelpButtons({ onExplainAgain, onCompare }: { onExplainAgain: ()=>void; onCompare: ()=>void }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onExplainAgain} className="rounded-full px-4 py-2 text-sm bg-slate-900 text-white hover:bg-slate-700">Explain Again</button>
      <button onClick={onCompare} className="rounded-full px-4 py-2 text-sm bg-purple-600 text-white hover:bg-purple-500">Compare My Answer</button>
    </div>
  )
}
