import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, FileType } from 'lucide-react'

export default async function TiposDocumentoPage() {
  const supabase = await createClient()
  const { data: tipos } = await supabase
    .from('document_types')
    .select('*')
    .order('nombre')

  return (
    <div>
      <div className="mb-6">
        <Link href="/compliance" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3">
          <ArrowLeft className="w-4 h-4" /> Compliance
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Tipos de Documento</h1>
        <p className="text-slate-500 text-sm mt-1">Categorías de documentos de compliance</p>
      </div>

      {(!tipos || tipos.length === 0) ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
            <FileType className="w-6 h-6 text-slate-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Sin tipos de documento</h2>
          <p className="text-sm text-slate-500">No hay tipos de documento configurados aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Obligatorio</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Alertas (días)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tipos.map((tipo) => (
                <tr key={tipo.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{tipo.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{tipo.obligatorio ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {[tipo.alerta_dias_30 && '30', tipo.alerta_dias_15 && '15', tipo.alerta_dias_7 && '7', tipo.alerta_dias_1 && '1']
                      .filter(Boolean).join(', ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
