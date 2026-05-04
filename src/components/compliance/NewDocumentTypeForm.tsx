'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createDocumentType } from '@/app/actions/compliance'

export function NewDocumentTypeForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const data = {
      nombre: fd.get('nombre') as string,
      descripcion: (fd.get('descripcion') as string) || undefined,
      aplica_a: fd.get('aplica_a') as 'empresa' | 'persona' | 'equipo',
      obligatorio: fd.get('obligatorio') === 'true',
      alerta_dias_30: fd.has('alerta_dias_30'),
      alerta_dias_15: fd.has('alerta_dias_15'),
      alerta_dias_7: fd.has('alerta_dias_7'),
      alerta_dias_1: fd.has('alerta_dias_1'),
    }
    startTransition(async () => {
      try {
        await createDocumentType(data)
        router.push('/compliance/tipos')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear el tipo')
      }
    })
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre *</label>
        <input name="nombre" required autoFocus className={inputClass} placeholder="Ej: Certificado de habilitación" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
        <textarea name="descripcion" rows={2} className={`${inputClass} resize-none`} placeholder="Para qué sirve este documento..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Aplica a *</label>
          <select name="aplica_a" required defaultValue="empresa" className={inputClass}>
            <option value="empresa">Empresa</option>
            <option value="persona">Persona</option>
            <option value="equipo">Equipo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">¿Obligatorio? *</label>
          <select name="obligatorio" defaultValue="true" className={inputClass}>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Alertas automáticas (días antes de vencimiento)</label>
        <div className="flex gap-4 flex-wrap">
          {[
            { name: 'alerta_dias_30', label: '30 días' },
            { name: 'alerta_dias_15', label: '15 días' },
            { name: 'alerta_dias_7', label: '7 días' },
            { name: 'alerta_dias_1', label: '1 día' },
          ].map(a => (
            <label key={a.name} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" name={a.name} defaultChecked className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              {a.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors">
          {isPending ? 'Creando...' : 'Crear tipo de documento'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
