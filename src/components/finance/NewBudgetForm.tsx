'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBudget } from '@/app/actions/finance'
import { formatARS } from '@/lib/utils/currency'
import { Plus, Trash2 } from 'lucide-react'

interface LineItem {
  descripcion: string
  cantidad: number
  precio_unitario: number
  descuento_porcentaje: number
  subtotal: number
}

interface Props {
  clientes: { id: string; nombre: string }[]
}

function calcSubtotal(cantidad: number, precio: number, descuento: number) {
  const bruto = cantidad * precio
  return bruto - bruto * (descuento / 100)
}

export function NewBudgetForm({ clientes }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<LineItem[]>([
    { descripcion: '', cantidad: 1, precio_unitario: 0, descuento_porcentaje: 0, subtotal: 0 }
  ])

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: value }
      updated.subtotal = calcSubtotal(
        Number(updated.cantidad),
        Number(updated.precio_unitario),
        Number(updated.descuento_porcentaje)
      )
      return updated
    }))
  }

  const total = items.reduce((s, i) => s + i.subtotal, 0)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const data = {
      titulo: fd.get('titulo') as string,
      cliente_id: fd.get('cliente_id') as string || undefined,
      fecha_emision: new Date().toISOString().split('T')[0],
      fecha_validez: fd.get('fecha_validez') as string || undefined,
      condiciones: fd.get('condiciones') as string || undefined,
      notas: fd.get('notas') as string || undefined,
      total,
      items: items.filter(i => i.descripcion.trim()).map(i => ({
        descripcion: i.descripcion,
        cantidad: Number(i.cantidad),
        precio_unitario: Number(i.precio_unitario),
        descuento_porcentaje: Number(i.descuento_porcentaje),
        subtotal: i.subtotal,
      })),
    }
    startTransition(async () => {
      try {
        const budget = await createBudget(data)
        router.push(`/finanzas/presupuestos/${budget.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear el presupuesto')
      }
    })
  }

  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">Datos del presupuesto</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
          <input
            name="titulo"
            required
            autoFocus
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
            placeholder="Ej: Mantenimiento preventivo planta industrial"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente</label>
            <select
              name="cliente_id"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Sin cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Validez hasta</label>
            <input
              type="date"
              name="fecha_validez"
              defaultValue={in30}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Condiciones de pago</label>
          <input
            name="condiciones"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="Ej: 50% a la firma, 50% a la entrega"
          />
        </div>
      </div>

      {/* Ítems */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Ítems</h2>
          <button
            type="button"
            onClick={() => setItems(prev => [...prev, { descripcion: '', cantidad: 1, precio_unitario: 0, descuento_porcentaje: 0, subtotal: 0 }])}
            className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700"
          >
            <Plus className="w-4 h-4" />
            Agregar ítem
          </button>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 px-1">
            <div className="col-span-4">Descripción</div>
            <div className="col-span-2">Cant.</div>
            <div className="col-span-2">Precio unit.</div>
            <div className="col-span-2">Dto. %</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4">
                <input
                  value={item.descripcion}
                  onChange={e => updateItem(idx, 'descripcion', e.target.value)}
                  placeholder="Servicio o producto"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number" min="1" step="1"
                  value={item.cantidad}
                  onChange={e => updateItem(idx, 'cantidad', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number" min="0" step="0.01"
                  value={item.precio_unitario}
                  onChange={e => updateItem(idx, 'precio_unitario', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number" min="0" max="100" step="0.5"
                  value={item.descuento_porcentaje}
                  onChange={e => updateItem(idx, 'descuento_porcentaje', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="col-span-1 text-right text-sm font-medium text-slate-800">
                {formatARS(item.subtotal)}
              </div>
              <div className="col-span-1 flex justify-end">
                {items.length > 1 && (
                  <button type="button" onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                    className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatARS(total)}</span>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas / Alcance</label>
        <textarea
          name="notas"
          rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          placeholder="Alcance del trabajo, exclusiones, condiciones especiales..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
        >
          {isPending ? 'Creando...' : 'Crear presupuesto'}
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
