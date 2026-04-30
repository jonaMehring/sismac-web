import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils/dates'

const ACTION_LABELS: Record<string, string> = {
  INSERT: 'Creó',
  UPDATE: 'Modificó',
  DELETE: 'Eliminó',
}

const TABLE_LABELS: Record<string, string> = {
  tasks: 'Tarea',
  invoices: 'Factura',
  budgets: 'Presupuesto',
  expenses: 'Gasto',
  client_documents: 'Documento',
  clientes: 'Cliente',
  usuarios: 'Usuario',
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ tabla?: string; usuario?: string; page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  if (!perfil || perfil.rol !== 'admin_sismac') redirect('/dashboard')

  const params = await searchParams
  const page = Number(params.page ?? 1)
  const PAGE_SIZE = 50
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('audit_log')
    .select(`*, usuario:usuarios!audit_log_usuario_id_fkey(nombre)`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (params.tabla) query = query.eq('tabla', params.tabla)
  if (params.usuario) query = query.eq('usuario_id', params.usuario)

  const { data: logs, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div>
      <PageHeader
        title="Auditoría"
        description="Historial inmutable de todas las acciones del sistema"
        icon={Shield}
        iconColor="bg-slate-700"
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50">
          <span className="text-xs text-slate-500">{count ?? 0} registros totales</span>
          <div className="flex gap-2 ml-auto">
            {Object.keys(TABLE_LABELS).map(t => (
              <a
                key={t}
                href={`?tabla=${t}`}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  params.tabla === t
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {TABLE_LABELS[t]}
              </a>
            ))}
            {params.tabla && (
              <a href="/audit/log" className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">
                Limpiar
              </a>
            )}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Cuándo</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Usuario</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Acción</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Tabla</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden xl:table-cell">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {(logs ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400">Sin registros</td>
              </tr>
            ) : (
              (logs as unknown as Array<{
                id: string; accion: string; tabla: string; registro_id: string;
                datos_anteriores: Record<string, unknown> | null
                datos_nuevos: Record<string, unknown> | null
                created_at: string; usuario_id: string
                usuario?: { nombre: string } | null
              }> ?? []).map(log => {
                const l = log
                return (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(l.created_at)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 hidden md:table-cell">
                      {l.usuario?.nombre ?? <span className="text-slate-400">Sistema</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        l.accion === 'INSERT' ? 'bg-green-100 text-green-700' :
                        l.accion === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {ACTION_LABELS[l.accion] ?? l.accion}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs hidden lg:table-cell">
                      {TABLE_LABELS[l.tabla] ?? l.tabla}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs font-mono hidden xl:table-cell">
                      {l.registro_id?.substring(0, 8)}…
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`?page=${page - 1}${params.tabla ? `&tabla=${params.tabla}` : ''}`}
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                  Anterior
                </a>
              )}
              {page < totalPages && (
                <a href={`?page=${page + 1}${params.tabla ? `&tabla=${params.tabla}` : ''}`}
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                  Siguiente
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
