'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markInvoicePaid, voidInvoice } from '@/app/actions/finance'
import type { InvoiceStatus } from '@/lib/types'

interface Props {
  invoiceId: string
  currentStatus: InvoiceStatus
}

export function InvoiceActions({ invoiceId, currentStatus }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPagoForm, setShowPagoForm] = useState(false)
  const [showAnularForm, setShowAnularForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleMarkPaid(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      try {
        await markInvoicePaid(
          invoiceId,
          fd.get('fecha_cobro') as string,
          fd.get('metodo_cobro') as string
        )
        router.refresh()
        setShowPagoForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      }
    })
  }

  function handleVoid(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      try {
        await voidInvoice(invoiceId, fd.get('motivo') as string)
        router.refresh()
        setShowAnularForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      }
    })
  }

  const canPay = ['emitida', 'enviada', 'vencida'].includes(currentStatus)
  const canVoid = ['borrador', 'emitida', 'enviada'].includes(currentStatus)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 space-y-3 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</h2>
      {error && <p className="text-xs text-red-500">{error}</p>}

      {canPay && !showPagoForm && (
        <button
          onClick={() => setShowPagoForm(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors"
        >
          Marcar como cobrada
        </button>
      )}

      {showPagoForm && (
        <form onSubmit={handleMarkPaid} className="space-y-2">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Fecha de cobro *</label>
            <input type="date" name="fecha_cobro" required defaultValue={today}
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Método *</label>
            <select name="metodo_cobro" required
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20">
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="cheque">Cheque</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg text-xs font-medium">
              Confirmar
            </button>
            <button type="button" onClick={() => setShowPagoForm(false)}
              className="flex-1 border border-slate-200 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {canVoid && !showAnularForm && (
        <button
          onClick={() => setShowAnularForm(true)}
          className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
        >
          Anular factura
        </button>
      )}

      {showAnularForm && (
        <form onSubmit={handleVoid} className="space-y-2">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Motivo *</label>
            <input name="motivo" required placeholder="Motivo de anulación"
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-xs font-medium">
              Anular
            </button>
            <button type="button" onClick={() => setShowAnularForm(false)}
              className="flex-1 border border-slate-200 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
