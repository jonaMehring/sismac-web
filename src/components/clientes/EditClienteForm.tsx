'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateCliente } from '@/app/actions/clients'
import type { Cliente } from '@/lib/types'

const PROVINCIAS = ['Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán']

export function EditClienteForm({ cliente }: { cliente: Cliente }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const data = {
      nombre: fd.get('nombre') as string,
      razon_social: (fd.get('razon_social') as string) || null,
      cuit: (fd.get('cuit') as string) || null,
      email: (fd.get('email') as string) || null,
      telefono: (fd.get('telefono') as string) || null,
      direccion: (fd.get('direccion') as string) || null,
      localidad: (fd.get('localidad') as string) || null,
      provincia: (fd.get('provincia') as string) || null,
      contacto_nombre: (fd.get('contacto_nombre') as string) || null,
      contacto_email: (fd.get('contacto_email') as string) || null,
      contacto_telefono: (fd.get('contacto_telefono') as string) || null,
      notas: (fd.get('notas') as string) || null,
    }
    startTransition(async () => {
      try {
        await updateCliente(cliente.id, data)
        router.push(`/clientes/${cliente.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar')
      }
    })
  }

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all'
  const lbl = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Datos de la empresa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={lbl}>Nombre comercial *</label>
            <input name="nombre" required defaultValue={cliente.nombre ?? ''} className={inp} />
          </div>
          <div>
            <label className={lbl}>Razón social</label>
            <input name="razon_social" defaultValue={cliente.razon_social ?? ''} className={inp} />
          </div>
          <div>
            <label className={lbl}>CUIT</label>
            <input name="cuit" defaultValue={cliente.cuit ?? ''} className={inp} placeholder="20-12345678-9" />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input type="email" name="email" defaultValue={cliente.email ?? ''} className={inp} />
          </div>
          <div>
            <label className={lbl}>Teléfono</label>
            <input name="telefono" defaultValue={cliente.telefono ?? ''} className={inp} />
          </div>
          <div className="md:col-span-2">
            <label className={lbl}>Dirección</label>
            <input name="direccion" defaultValue={cliente.direccion ?? ''} className={inp} />
          </div>
          <div>
            <label className={lbl}>Localidad</label>
            <input name="localidad" defaultValue={cliente.localidad ?? ''} className={inp} />
          </div>
          <div>
            <label className={lbl}>Provincia</label>
            <select name="provincia" defaultValue={cliente.provincia ?? 'Buenos Aires'} className={inp}>
              {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Contacto principal</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Nombre</label>
            <input name="contacto_nombre" defaultValue={cliente.contacto_nombre ?? ''} className={inp} />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input type="email" name="contacto_email" defaultValue={cliente.contacto_email ?? ''} className={inp} />
          </div>
          <div>
            <label className={lbl}>Teléfono</label>
            <input name="contacto_telefono" defaultValue={cliente.contacto_telefono ?? ''} className={inp} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className={lbl}>Notas internas</label>
        <textarea name="notas" rows={3} defaultValue={cliente.notas ?? ''} className={`${inp} resize-none`} placeholder="Información relevante, acuerdos, observaciones..." />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={isPending}
          className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-sm">
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-5 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
