'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { approveBudget, rejectBudget, convertBudgetToInvoice } from '@/app/actions/finance'
import type { BudgetStatus } from '@/lib/types'

interface Props {
  budgetId: string
  currentStatus: BudgetStatus
  invoiceId?: string | null
}

export function BudgetActions({ budgetId, currentStatus, invoiceId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handle(fn: () => Promise<unknown>) {
    setError(null)
    startTransition(async () => {
      try { await fn(); router.refresh() }
      catch (err) { setError(err instanceof Error ? err.message : 'Error') }
    })
  }

  function handleReject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    handle(async () => {
      await rejectBudget(budgetId, fd.get('motivo') as string)
      setShowRejectForm(false)
    })
  }

  const canApprove = currentStatus === 'borrador' || currentStatus === 'enviado'
  const canReject = currentStatus === 'borrador' || currentStatus === 'enviado'
  const canConvert = currentStatus === 'aprobado' && !invoiceId

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 space-y-3 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</h2>
      {error && <p className="text-xs text-red-500">{error}</p>}

      {canApprove && (
        <button
          onClick={() => handle(() => approveBudget(budgetId))}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors"
        >
          Aprobar presupuesto
        </button>
      )}

      {canConvert && (
        <button
          onClick={() => handle(() => convertBudgetToInvoice(budgetId))}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors"
        >
          Convertir a factura
        </button>
      )}

      {invoiceId && (
        <a
          href={`/finanzas/facturas/${invoiceId}`}
          className="block w-full text-center border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
        >
          Ver factura generada →
        </a>
      )}

      {canReject && !showRejectForm && (
        <button
          onClick={() => setShowRejectForm(true)}
          className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
        >
          Rechazar
        </button>
      )}

      {showRejectForm && (
        <form onSubmit={handleReject} className="space-y-2">
          <input name="motivo" required placeholder="Motivo de rechazo"
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-xs font-medium">
              Rechazar
            </button>
            <button type="button" onClick={() => setShowRejectForm(false)}
              className="flex-1 border border-slate-200 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
