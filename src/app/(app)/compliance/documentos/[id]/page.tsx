import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDate, diasParaVencer } from '@/lib/utils/dates'
import { DocumentStatusBadge, VencimientoBadge } from '@/components/shared/StatusBadge'
import { DocumentActions } from '@/components/compliance/DocumentActions'

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: doc } = await supabase
    .from('client_documents')
    .select(`
      *,
      cliente:clientes(id, nombre, cuit),
      document_type:document_types(id, nombre, obligatorio),
      cargado_por_user:usuarios!client_documents_cargado_por_fkey(nombre),
      aprobado_por_user:usuarios!client_documents_aprobado_por_fkey(nombre)
    `)
    .eq('id', id)
    .single()

  if (!doc) notFound()

  const d = doc as typeof doc & {
    cliente?: { id: string; nombre: string; cuit?: string } | null
    document_type?: { id: string; nombre: string; obligatorio: boolean } | null
    cargado_por_user?: { nombre: string } | null
    aprobado_por_user?: { nombre: string } | null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/compliance/documentos" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
          Volver a documentos
        </Link>
      </div>

      <div className="space-y-4">
        {/* Principal */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs text-slate-400 mb-1">{d.document_type?.nombre ?? 'Documento'}</p>
              <h1 className="text-lg font-bold text-slate-900">{d.nombre_archivo}</h1>
              {d.cliente && <p className="text-sm text-slate-500 mt-1">{d.cliente.nombre}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <DocumentStatusBadge status={d.estado} />
              <VencimientoBadge dias={diasParaVencer(d.fecha_vencimiento)} />
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            {d.fecha_emision && (
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Fecha de emisión</dt>
                <dd className="font-medium text-slate-800">{formatDate(d.fecha_emision)}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-slate-400 mb-0.5">Vencimiento</dt>
              <dd className="font-medium text-slate-800">{formatDate(d.fecha_vencimiento)}</dd>
            </div>
            {d.cargado_por_user && (
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Cargado por</dt>
                <dd className="text-slate-700">{d.cargado_por_user.nombre}</dd>
              </div>
            )}
            {d.aprobado_por_user && (
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Aprobado por</dt>
                <dd className="text-slate-700">{d.aprobado_por_user.nombre}</dd>
              </div>
            )}
            {d.aprobado_en && (
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Fecha aprobación</dt>
                <dd className="text-slate-700">{formatDate(d.aprobado_en)}</dd>
              </div>
            )}
          </dl>

          {d.archivo_url && (
            <a
              href={d.archivo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Ver archivo
            </a>
          )}

          {d.notas && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Notas</p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{d.notas}</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <DocumentActions
          documentId={d.id}
          currentStatus={d.estado}
          clienteId={d.cliente_id}
          documentTypeId={d.document_type_id}
        />
      </div>
    </div>
  )
}
