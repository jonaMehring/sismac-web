'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createExpense } from '@/app/actions/finance'

interface Props {
  categorias: { id: string; nombre: string; color: string }[]
  proveedores: { id: string; nombre: string }[]
  clientes: { id: string; nombre: string }[]
  centros: { id: string; codigo: string; nombre: string }[]
}

export function NewExpenseForm({ categorias, proveedores, clientes, centros }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const data = {
      descripcion: fd.get('descripcion') as string,
      monto: Number(fd.get('monto')),
      moneda: 'ARS',
      fecha: fd.get('fecha') as string,
      category_id: fd.get('category_id') as string || undefined,
      proveedor_id: fd.get('proveedor_id') as string || undefined,
      cliente_id: fd.get('cliente_id') as string || undefined,
      cost_center_id: fd.get('cost_center_id') as string || undefined,
      notas: fd.get('notas') as string || undefined,
    }
    startTransition(async () => {
      try {
        await createExpense(data)
        router.push('/finanzas/gastos')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al registrar el gasto')
      }
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción *</label>
        <input
          name="descripcion"
          required
          autoFocus
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          placeholder="Ej: Compra materiales de limpieza"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto (ARS) *</label>
          <input
            type="number"
            name="monto"
            required
            min="0"
            step="0.01"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha *</label>
          <input
            type="date"
            name="fecha"
            required
            defaultValue={today}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
          <select
            name="category_id"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Sin categoría</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Proveedor</label>
          <select
            name="proveedor_id"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Sin proveedor</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente</label>
          <select
            name="cliente_id"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Sin cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Centro de costo</label>
          <select
            name="cost_center_id"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Sin centro</option>
            {centros.map(cc => (
              <option key={cc.id} value={cc.id}>{cc.codigo} — {cc.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas</label>
        <textarea
          name="notas"
          rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Información adicional..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
        >
          {isPending ? 'Guardando...' : 'Registrar gasto'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
