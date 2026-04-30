'use client'

import { useState, useTransition } from 'react'
import { addTaskComment } from '@/app/actions/bpm'
import { Send } from 'lucide-react'

export function CommentForm({ taskId }: { taskId: string }) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError(null)
    startTransition(async () => {
      try {
        await addTaskComment({ task_id: taskId, contenido: content.trim(), tipo: 'comentario' })
        setContent('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar comentario')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Escribe un comentario..."
        rows={2}
        className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-400"
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent)
        }}
      />
      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="self-end bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </form>
  )
}
