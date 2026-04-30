'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { approveDocument } from '@/app/actions/compliance'
import type { DocumentStatus } from '@/lib/types'

interface Props {
  documentId: string
  currentStatus: DocumentStatus
  clienteId: string
  documentTypeId: string
}

export function DocumentActions({ documentId, currentStatus }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handle(fn: () => Promise<unknown>) {
    setError(null)
    startTransition(async () => {
      try { await fn(); router.refresh() }
      catch (err) { setError(err instanceof Error ? err.message : 'Error') }
    })
  }

  const canApprove = currentStatus === 'pendiente_aprobacion'
  const canRenew = currentStatus === 'vencido' || currentStatus === 'por_vencer' || currentStatus === 'vigente'

  if (!canApprove && !canRenew) return null

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 space-y-3 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</h2>
      {error && <p className="text-xs text-red-500">{error}</p>}

      {canApprove && (
        <button
          onClick={() => handle(() => approveDocument(documentId))}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors"
        >
          Aprobar documento
        </button>
      )}

      {canRenew && (
        <a
          href={`/compliance/documentos/nuevo?reemplaza=${documentId}`}
          className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors"
        >
          Renovar documento
        </a>
      )}
    </div>
  )
}
