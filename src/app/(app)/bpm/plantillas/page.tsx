import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LayoutTemplate, Plus, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'
import type { ProcessTemplate } from '@/lib/types'

const CATEGORIA_LABEL: Record<string, string> = {
  mantenimiento: 'Mantenimiento',
  administrativo: 'Administrativo',
  compliance: 'Compliance',
  ventas: 'Ventas',
  otro: 'Otro',
}
const CATEGORIA_COLOR: Record<string, string> = {
  mantenimiento: 'bg-orange-100 text-orange-700',
  administrativo: 'bg-blue-100 text-blue-700',
  compliance: 'bg-green-100 text-green-700',
  ventas: 'bg-purple-100 text-purple-700',
  otro: 'bg-slate-100 text-slate-600',
}

export default async function PlantillasPage() {
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from('process_templates')
    .select(`
      *,
      stages:process_stages(count)
    `)
    .order('nombre')

  const { data: stagesCount } = await supabase
    .from('process_stages')
    .select('template_id')

  const stagesByTemplate: Record<string, number> = {}
  for (const s of (stagesCount ?? [])) {
    stagesByTemplate[s.template_id] = (stagesByTemplate[s.template_id] ?? 0) + 1
  }

  return (
    <div>
      <PageHeader
        title="Plantillas"
        description="Modelos de procesos reutilizables"
        icon={LayoutTemplate}
        iconColor="bg-purple-600"
        actions={
          <Link href="/bpm/plantillas/nueva" className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Nueva plantilla
          </Link>
        }
      />

      {(templates ?? []).length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="Sin plantillas"
          description="Crea plantillas para estandarizar tus procesos operativos"
          action={
            <Link href="/bpm/plantillas/nueva" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
              Nueva plantilla
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(templates as unknown as ProcessTemplate[]).map(t => (
            <div key={t.id} className={cn('bg-white rounded-xl border p-5 flex flex-col gap-3', t.activo ? 'border-slate-200' : 'border-slate-100 opacity-60')}>
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <LayoutTemplate className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-center gap-1">
                  {t.activo
                    ? <CheckCircle className="w-4 h-4 text-green-500" />
                    : <XCircle className="w-4 h-4 text-slate-400" />
                  }
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{t.nombre}</p>
                {t.descripcion && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{t.descripcion}</p>}
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {t.categoria && (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', CATEGORIA_COLOR[t.categoria] ?? 'bg-slate-100 text-slate-600')}>
                      {CATEGORIA_LABEL[t.categoria] ?? t.categoria}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{stagesByTemplate[t.id] ?? 0} etapas</p>
                  <p className="text-xs text-slate-400">v{t.version} · {formatDate(t.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
