import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { diasParaVencer } from '@/lib/utils/dates'

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function toMondayFirst(jsDay: number): number {
  return (jsDay + 6) % 7
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const params = await searchParams
  const today = new Date()
  let year = today.getFullYear()
  let month = today.getMonth()

  if (params.mes) {
    const parts = params.mes.split('-')
    if (parts.length === 2) {
      year = parseInt(parts[0], 10)
      month = parseInt(parts[1], 10) - 1
    }
  }

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startOffset = toMondayFirst(firstDay.getDay())

  const prevMonth = month === 0 ? `${year - 1}-12` : `${year}-${String(month).padStart(2, '0')}`
  const nextMonth = month === 11 ? `${year + 1}-01` : `${year}-${String(month + 2).padStart(2, '0')}`

  const supabase = await createClient()
  const { data: docs } = await supabase
    .from('client_documents')
    .select(`
      id, fecha_vencimiento, estado,
      cliente:clientes(nombre),
      document_type:document_types(nombre)
    `)
    .gte('fecha_vencimiento', firstDay.toISOString().split('T')[0])
    .lte('fecha_vencimiento', lastDay.toISOString().split('T')[0])
    .neq('estado', 'renovado')
    .order('fecha_vencimiento')

  type DocEntry = {
    id: string
    fecha_vencimiento: string
    estado: string
    cliente: { nombre: string } | null
    document_type: { nombre: string } | null
  }

  const docsByDay: Record<number, DocEntry[]> = {}
  for (const doc of (docs ?? []) as DocEntry[]) {
    const d = new Date(doc.fecha_vencimiento + 'T12:00:00').getDate()
    if (!docsByDay[d]) docsByDay[d] = []
    docsByDay[d].push(doc)
  }

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : null

  return (
    <div>
      <PageHeader
        title="Calendario de Vencimientos"
        description="Vista mensual de documentos por vencer"
        icon={CalendarDays}
        iconColor="bg-orange-600"
        actions={
          <Link href="/compliance/documentos/nuevo" className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
            + Cargar documento
          </Link>
        }
      />

      {/* Navegación de mes */}
      <div className="flex items-center justify-between mb-4">
        <Link href={`?mes=${prevMonth}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-lg font-semibold text-slate-800">
          {MESES[month]} {year}
        </h2>
        <Link href={`?mes=${nextMonth}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 mb-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />Vencido</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-400 inline-block" />Vence en 7 días</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />Vence en 30 días</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" />Vigente</span>
      </div>

      {/* Grilla del calendario */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="min-h-[80px] bg-slate-50/50" />

            const dayDocs = docsByDay[day] ?? []
            const isToday = day === todayDay
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

            return (
              <div key={day} className={cn('min-h-[80px] p-2 relative', isToday && 'bg-blue-50/60')}>
                <span className={cn(
                  'inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full mb-1',
                  isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                )}>
                  {day}
                </span>
                <div className="space-y-0.5">
                  {dayDocs.slice(0, 3).map(doc => {
                    const dias = diasParaVencer(dateStr)
                    const dotColor = dias < 0 ? 'bg-red-500' : dias <= 7 ? 'bg-orange-400' : dias <= 30 ? 'bg-yellow-400' : 'bg-green-400'
                    const textColor = dias < 0 ? 'text-red-700' : dias <= 7 ? 'text-orange-700' : 'text-slate-600'
                    return (
                      <Link key={doc.id} href={`/compliance/documentos/${doc.id}`} className="flex items-center gap-1 group">
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
                        <span className={cn('text-xs truncate max-w-full group-hover:underline leading-tight', textColor)}>
                          {doc.cliente?.nombre ?? doc.document_type?.nombre ?? 'Doc.'}
                        </span>
                      </Link>
                    )
                  })}
                  {dayDocs.length > 3 && (
                    <p className="text-xs text-slate-400 pl-2.5">+{dayDocs.length - 3} más</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Listado del mes */}
      {(docs ?? []).length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Detalle del mes — {(docs ?? []).length} vencimiento{(docs ?? []).length !== 1 ? 's' : ''}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Documento</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Días</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {((docs ?? []) as DocEntry[]).map(doc => {
                  const dias = diasParaVencer(doc.fecha_vencimiento)
                  const diasColor = dias < 0 ? 'text-red-600 font-medium' : dias <= 7 ? 'text-orange-600' : dias <= 30 ? 'text-yellow-700' : 'text-green-700'
                  const diasLabel = dias < 0 ? `Vencido hace ${Math.abs(dias)}d` : dias === 0 ? 'Hoy' : `${dias}d`
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600 text-xs">{new Date(doc.fecha_vencimiento + 'T12:00:00').toLocaleDateString('es-AR')}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{doc.cliente?.nombre ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{doc.document_type?.nombre ?? '—'}</td>
                      <td className={cn('px-4 py-3 text-xs', diasColor)}>{diasLabel}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/compliance/documentos/${doc.id}`} className="text-xs text-blue-600 hover:underline">Ver</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(docs ?? []).length === 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 py-12 text-center">
          <p className="text-slate-400 text-sm">No hay vencimientos en {MESES[month]} {year}</p>
        </div>
      )}
    </div>
  )
}
