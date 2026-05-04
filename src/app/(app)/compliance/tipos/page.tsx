import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileType, Plus, Check, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { DocumentType } from '@/lib/types'

const APLICA_A_LABEL: Record<string, string> = {
  empresa: 'Empresa',
  persona: 'Persona',
  equipo: 'Equipo',
}
const APLICA_A_COLOR: Record<string, string> = {
  empresa: 'bg-blue-100 text-blue-700',
  persona: 'bg-purple-100 text-purple-700',
  equipo: 'bg-orange-100 text-orange-700',
}

export default async function TiposDocumentoPage() {
  const supabase = await createClient()

  const { data: tipos } = await supabase
    .from('document_types')
    .select('*')
    .order('nombre')

  return (
    <div>
      <PageHeader
        title="Tipos de Documento"
        description="Categorías de documentos de compliance y sus reglas de alerta"
        icon={FileType}
        iconColor="bg-teal-600"
        actions={
          <Link href="/compliance/tipos/nuevo" className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Nuevo tipo
          </Link>
        }
      />

      {(tipos ?? []).length === 0 ? (
        <EmptyState
          icon={FileType}
          title="Sin tipos de documento"
          description="Define los tipos de documentos que vas a gestionar para tus clientes"
          action={
            <Link href="/compliance/tipos/nuevo" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700">
              Nuevo tipo
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Aplica a</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Alertas (días)</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Obligatorio</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Activo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(tipos as DocumentType[]).map(tipo => {
                const alertaDias = [
                  tipo.alerta_dias_30 && '30',
                  tipo.alerta_dias_15 && '15',
                  tipo.alerta_dias_7 && '7',
                  tipo.alerta_dias_1 && '1',
                ].filter(Boolean).join(', ')

                return (
                  <tr key={tipo.id} className={cn('hover:bg-slate-50 transition-colors', !tipo.activo && 'opacity-50')}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{tipo.nombre}</p>
                      {tipo.descripcion && <p className="text-xs text-slate-400 mt-0.5">{tipo.descripcion}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', APLICA_A_COLOR[tipo.aplica_a] ?? 'bg-slate-100 text-slate-600')}>
                        {APLICA_A_LABEL[tipo.aplica_a] ?? tipo.aplica_a}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {alertaDias ? (
                        <span className="text-xs text-slate-600 font-mono">{alertaDias}d</span>
                      ) : (
                        <span className="text-xs text-slate-400">Sin alertas</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-center">
                      {tipo.obligatorio
                        ? <Check className="w-4 h-4 text-green-600 mx-auto" />
                        : <X className="w-4 h-4 text-slate-300 mx-auto" />
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      {tipo.activo
                        ? <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                        : <span className="inline-block w-2 h-2 rounded-full bg-slate-300" />
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
