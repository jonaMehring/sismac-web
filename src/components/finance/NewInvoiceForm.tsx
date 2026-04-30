'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createInvoice } from '@/app/actions/finance'
import { formatARS } from '@/lib/utils/currency'
import { Plus, Trash2 } from 'lucide-react'

interface LineItem {
  descripcion: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface Props {
  clientes: { id: string; nombre: string }[]
}

export function NewInvoiceForm({ clientes }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<LineItem[]>([
    { descripcion: '', cantidad: 1, precio_unitario: 0, subtotal: 0 }
  ])
  const [ivaRate, setIvaRate] = useState(21)

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: value }
      if (field === 'cantidad' || field === 'precio_unitario') {
        updated.subtotal = Number(updated.cantidad) * Number(updated.precio_unitario)
      }
      return updated
    }))
  }

  function addItem() {
    setItems(prev => [...prev, { descripcion: '', cantidad: 1, precio_unitario: 0, subtotal: 0 }])
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const subtotalTotal = items.reduce((s, i) => s + i.subtotal, 0)
  const ivaMonto = subtotalTotal * (ivaRate / 100)
  const total = subtotalTotal + ivaMonto

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const data = {
      tipo: fd.get('tipo') as string,
      cliente_id: fd.get('cliente_id') as string || undefined,
      fecha_emision: fd.get('fecha_emision') as string,
      fecha_vencimiento: fd.get('fecha_vencimiento') as string,
      condiciones_pago: fd.get('condiciones_pago') as string || undefined,
      notas: fd.get('notas') as string || undefined,
      subtotal: subtotalTotal,
      iva_porcentaje: ivaRate,
      iva_monto: ivaMonto,
      total,
      items: items.filter(i => i.descripcion.trim()).map(i => ({
        descripcion: i.descripcion,
        cantidad: Number(i.cantidad),
        precio_unitario: Number(i.precio_unitario),
        subtotal: i.subtotal,
      })),
    }
    startTransition(async () => {
      try {
        const invoice = await createInvoice(data)
        router.push(`/finanzas/facturas/${invoice.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear la factura')
      }
    })
  }

  const today = new Date().toISOString().split('T')[0]
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Datos principales */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">Datos de la factura</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo *</label>
            <select
              name="tipo"
              required
              defaultValue="A"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="A">Factura A</option>
              <option value="B">Factura B</option>
              <option value="C">Factura C</option>
              <option value="X">Comprobante X</option>
            </select>
          </div>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha de emisión *</label>
            <input
              type="date"
              name="fecha_emision"
              required
              defaultValue={today}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Vencimiento *</label>
            <input
              type="date"
              name="fecha_vencimiento"
              required
              defaultValue={in30}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Condiciones de pago</label>
            <input
              name="condiciones_pago"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Ej: 30 días"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">IVA %</label>
            <select
              value={ivaRate}
              onChange={e => setIvaRate(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value={0}>Sin IVA (0%)</option>
              <option value={10.5}>10.5%</option>
              <option value={21}>21%</option>
              <option value={27}>27%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ítems */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Ítems</h2>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Agregar ítem
          </button>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 px-1">
            <div className="col-span-5">Descripción</div>
            <div className="col-span-2">Cant.</div>
            <div className="col-span-3">Precio unit.</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <input
                  value={item.descripcion}
                  onChange={e => updateItem(idx, 'descripcion', e.target.value)}
                  placeholder="Descripción del servicio/producto"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={item.cantidad}
                  onChange={e => updateItem(idx, 'cantidad', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.precio_unitario}
                  onChange={e => updateItem(idx, 'precio_unitario', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="col-span-1 text-right text-sm font-medium text-slate-800">
                {formatARS(item.subtotal)}
              </div>
              <div className="col-span-1 flex justify-end">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-1.5">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium">{formatARS(subtotalTotal)}</span>
          </div>
          {ivaRate > 0 && (
            <div className="flex justify-between text-sm text-slate-600">
              <span>IVA ({ivaRate}%)</span>
              <span className="font-medium">{formatARS(ivaMonto)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200 mt-1">
            <span>Total</span>
            <span>{formatARS(total)}</span>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas / Observaciones</label>
        <textarea
          name="notas"
          rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Condiciones adicionales, instrucciones de pago, etc."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
        >
          {isPending ? 'Creando...' : 'Crear factura'}
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
