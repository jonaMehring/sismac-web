import Link from 'next/link'
import { ArrowLeft, CalendarDays } from 'lucide-react'

export default function CalendarioPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/compliance" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3">
          <ArrowLeft className="w-4 h-4" /> Compliance
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Calendario de Vencimientos</h1>
        <p className="text-slate-500 text-sm mt-1">Vista visual de vencimientos por mes</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
          <CalendarDays className="w-6 h-6 text-orange-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Módulo en desarrollo</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          El calendario visual de vencimientos con semáforo de riesgo estará disponible próximamente.
        </p>
        <Link
          href="/compliance/documentos"
          className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver Documentos
        </Link>
      </div>
    </div>
  )
}
