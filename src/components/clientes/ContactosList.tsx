'use client'

import { useState, useTransition } from 'react'
import { createContacto, deleteContacto } from '@/app/actions/clients'
import { UserPlus, Trash2, Star, Phone, Mail, Briefcase } from 'lucide-react'
import type { ClienteContacto } from '@/lib/types'

interface Props {
  contactos: ClienteContacto[]
  clienteId: string
}

export function ContactosList({ contactos: initial, clienteId }: Props) {
  const [contactos, setContactos] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all'
  const lbl = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide'

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const newContacto = await createContacto({
          cliente_id: clienteId,
          nombre: fd.get('nombre') as string,
          cargo: (fd.get('cargo') as string) || undefined,
          email: (fd.get('email') as string) || undefined,
          telefono: (fd.get('telefono') as string) || undefined,
          es_principal: fd.get('es_principal') === 'on',
        })
        setContactos(prev => [...prev, newContacto as ClienteContacto])
        ;(e.target as HTMLFormElement).reset()
        setShowForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al agregar contacto')
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteContacto(id, clienteId)
        setContactos(prev => prev.filter(c => c.id !== id))
      } catch {
        // silently fail — page will refresh
      }
    })
  }

  return (
    <div className="space-y-3">
      {contactos.length === 0 && !showForm && (
        <p className="text-sm text-slate-400 text-center py-6">Sin contactos registrados</p>
      )}

      {contactos.map(c => (
        <div key={c.id} className="flex items-start gap-4 bg-white rounded-2xl border border-slate-100 p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {c.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800 text-sm">{c.nombre}</span>
              {c.es_principal && (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                  <Star className="w-3 h-3" /> Principal
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {c.cargo && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Briefcase className="w-3 h-3" /> {c.cargo}
                </span>
              )}
              {c.email && (
                <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700">
                  <Mail className="w-3 h-3" /> {c.email}
                </a>
              )}
              {c.telefono && (
                <a href={`tel:${c.telefono}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
                  <Phone className="w-3 h-3" /> {c.telefono}
                </a>
              )}
            </div>
          </div>
          <button onClick={() => handleDelete(c.id)} disabled={isPending}
            className="text-slate-300 hover:text-red-400 transition-colors shrink-0 disabled:opacity-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleAdd} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Nombre *</label>
              <input name="nombre" required className={inp} placeholder="Nombre completo" />
            </div>
            <div>
              <label className={lbl}>Cargo</label>
              <input name="cargo" className={inp} placeholder="Ej: Jefe de mantenimiento" />
            </div>
            <div>
              <label className={lbl}>Email</label>
              <input type="email" name="email" className={inp} placeholder="correo@empresa.com" />
            </div>
            <div>
              <label className={lbl}>Teléfono</label>
              <input name="telefono" className={inp} placeholder="+54 11 1234-5678" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" name="es_principal" className="rounded border-slate-300 text-amber-500" />
            Marcar como contacto principal
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors">
              {isPending ? 'Guardando...' : 'Agregar contacto'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(null) }}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">
          <UserPlus className="w-4 h-4" /> Agregar contacto
        </button>
      )}
    </div>
  )
}
