'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 transition-colors"
    >
      <Printer className="w-4 h-4" /> Imprimir / PDF
    </button>
  )
}
