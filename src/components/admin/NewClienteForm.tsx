'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createCliente } from '@/app/actions/clients'

export function NewClienteForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const data = {
      nombre: fd.get('nombre') as string,
      razon_social: fd.get('razon_social') as string || undefined,
      cuit: fd.get('cuit') as string || undefined,
      email: fd.get('email') as string || undefined,
      telefono: fd.get('telefono') as string || undefined,
      direccion: fd.get('direccion') as string || undefined,
      localidad: fd.get('localidad') as string || undefined,
      provincia: fd.get('provincia') as string || undefined,
      contacto_nombre: fd.get('contacto_nombre') as string || undefined,
      contacto_email: fd.get('contacto_email') as string || undefined,
      contacto_telefono: fd.get('contacto_telefono') as string || undefined,
      notas: fd.get('notas') as string || undefined,
    }
    startTransition(async () => {
      try {
        const cliente = await createCliente(data)
        router.push(`/clientes/${cliente.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear el cliente')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre comercial *</label>
          <input name="nombre" required autoFocus
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Ej: Empresa Industrial S.A." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Razón social</label>
          <input name="razon_social"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Razón social legal" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">CUIT</label>
          <input name="cuit"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="XX-XXXXXXXX-X" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input name="email" type="email"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
          <input name="telefono"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="+54 11 XXXX-XXXX" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Dirección</label>
          <input name="direccion"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Calle y número" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Localidad</label>
          <input name="localidad"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Provincia</label>
          <input name="provincia" defaultValue="Buenos Aires"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Contacto principal</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre del contacto</label>
            <input name="contacto_nombre"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email contacto</label>
            <input name="contacto_email" type="email"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tel. contacto</label>
            <input name="contacto_telefono"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas internas</label>
        <textarea name="notas" rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          placeholder="Información interna, condiciones especiales..." />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors">
          {isPending ? 'Guardando...' : 'Crear cliente'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
