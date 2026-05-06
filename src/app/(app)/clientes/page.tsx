import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'
import { ClientesListView, type ClienteWithStats } from '@/components/clientes/ClientesListView'
import type { Cliente } from '@/lib/types'

export default async function ClientesPage() {
  const supabase = await createClient()

  const results = await Promise.allSettled([
    supabase.from('clientes').select('*').order('nombre'),
    supabase.from('sectores').select('id, cliente_id').eq('activo', true),
    supabase.from('equipos').select('id, sector_id'),
    supabase.from('client_documents').select('cliente_id, estado').neq('estado', 'renovado'),
    supabase.from('tasks').select('cliente_id').in('estado', ['pendiente', 'en_curso', 'demorada']),
  ])

  const clientes = results[0].status === 'fulfilled' ? results[0].value.data : null
  const sectores  = results[1].status === 'fulfilled' ? results[1].value.data : null
  const equipos   = results[2].status === 'fulfilled' ? results[2].value.data : null
  const docs      = results[3].status === 'fulfilled' ? results[3].value.data : null
  const tareas    = results[4].status === 'fulfilled' ? results[4].value.data : null

  // Build maps for efficient lookup
  const sectorsByCliente = new Map<string, string[]>()
  for (const s of sectores ?? []) {
    const arr = sectorsByCliente.get(s.cliente_id) ?? []
    arr.push(s.id)
    sectorsByCliente.set(s.cliente_id, arr)
  }

  const equiposBySector = new Map<string, number>()
  for (const e of equipos ?? []) {
    equiposBySector.set(e.sector_id, (equiposBySector.get(e.sector_id) ?? 0) + 1)
  }

  const complianceByCliente = new Map<string, 'ok' | 'warning' | 'danger'>()
  for (const d of docs ?? []) {
    const cur = complianceByCliente.get(d.cliente_id)
    if (d.estado === 'vencido') complianceByCliente.set(d.cliente_id, 'danger')
    else if (d.estado === 'por_vencer' && cur !== 'danger') complianceByCliente.set(d.cliente_id, 'warning')
    else if (!cur) complianceByCliente.set(d.cliente_id, 'ok')
  }

  const tareasByCliente = new Map<string, number>()
  for (const t of tareas ?? []) {
    if (t.cliente_id) tareasByCliente.set(t.cliente_id, (tareasByCliente.get(t.cliente_id) ?? 0) + 1)
  }

  const clientesWithStats: ClienteWithStats[] = (clientes as unknown as Cliente[] ?? []).map(c => {
    const mis_sectores = sectorsByCliente.get(c.id) ?? []
    const mis_equipos = mis_sectores.reduce((acc, sid) => acc + (equiposBySector.get(sid) ?? 0), 0)
    return {
      ...c,
      sectoresCount: mis_sectores.length,
      equiposCount: mis_equipos,
      tareasCount: tareasByCliente.get(c.id) ?? 0,
      compliance: complianceByCliente.get(c.id) ?? 'none',
    }
  })

  const totalActivos = clientesWithStats.filter(c => c.activo).length
  const conAlertas = clientesWithStats.filter(c => c.compliance === 'warning' || c.compliance === 'danger').length
  const conVencidos = clientesWithStats.filter(c => c.compliance === 'danger').length

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gestión y seguimiento de clientes industriales"
        icon={Building2}
        iconColor="bg-cyan-600"
        actions={
          <Link href="/clientes/nuevo"
            className="flex items-center gap-1.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all">
            <Plus className="w-4 h-4" /> Nuevo cliente
          </Link>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',        value: clientesWithStats.length, cls: 'text-slate-700' },
          { label: 'Activos',      value: totalActivos,             cls: 'text-emerald-600' },
          { label: 'Con alertas',  value: conAlertas,               cls: conAlertas > 0 ? 'text-amber-600' : 'text-slate-700' },
          { label: 'Docs vencidos',value: conVencidos,              cls: conVencidos > 0 ? 'text-red-600' : 'text-slate-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 px-4 py-3" style={{ boxShadow: 'var(--shadow-card)' }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <ClientesListView clientes={clientesWithStats} />
    </div>
  )
}
