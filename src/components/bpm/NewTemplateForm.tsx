'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createTemplate } from '@/app/actions/bpm'

export function NewTemplateForm() {
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
      categoria: (fd.get('categoria') as string) || undefined,
    }
    startTransition(async () => {
      try {
        await createTemplate(data)
        router.push('/bpm/plantillas')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear la plantilla')
      }
    })
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre *</label>
        <input name="nombre" required autoFocus className={inputClass} placeholder="Ej: Inspección de equipos mensual" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
        <textarea name="descripcion" rows={3} className={`${inputClass} resize-none`} placeholder="Para qué se usa esta plantilla..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
        <select name="categoria" className={inputClass}>
          <option value="">Sin categoría</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="administrativo">Administrativo</option>
          <option value="compliance">Compliance</option>
          <option value="ventas">Ventas</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors">
          {isPending ? 'Creando...' : 'Crear plantilla'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
