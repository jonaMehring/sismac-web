import Link from 'next/link'
import { ArrowLeft, LayoutTemplate } from 'lucide-react'

export default function PlantillasPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/bpm" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3">
          <ArrowLeft className="w-4 h-4" /> Operaciones
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Plantillas</h1>
        <p className="text-slate-500 text-sm mt-1">Plantillas de procesos reutilizables</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
          <LayoutTemplate className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Módulo en desarrollo</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Las plantillas de procesos permiten estandarizar flujos de trabajo y reutilizarlos. Estará disponible próximamente.
        </p>
        <Link
          href="/bpm/tareas"
          className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir a Mis Tareas
        </Link>
      </div>
    </div>
  )
}
