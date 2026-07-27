import { cn } from '@/lib/utils/cn'
import {
  EQUIPO_ESTADO_META, TIPO_INSPECCION_META, RESULTADO_META, ESTADO_RESULTANTE_META,
  CRITICIDAD_META, ITEM_ESTADO_META,
  type InspeccionResultado, type TipoInspeccion, type Criticidad, type ItemEstado, type EstadoResultante,
} from '@/lib/inspecciones/config'

const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border'

export function EquipoEstadoBadge({ estado, className }: { estado: string; className?: string }) {
  const m = EQUIPO_ESTADO_META[estado] ?? EQUIPO_ESTADO_META.operativo
  return (
    <span className={cn(base, m.cls, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', m.dot)} /> {m.label}
    </span>
  )
}

export function TipoInspeccionBadge({ tipo, className }: { tipo: TipoInspeccion; className?: string }) {
  const m = TIPO_INSPECCION_META[tipo] ?? TIPO_INSPECCION_META.preventiva
  return <span className={cn(base, m.cls, className)}>{m.label}</span>
}

export function ResultadoBadge({ resultado, className }: { resultado: InspeccionResultado; className?: string }) {
  const m = RESULTADO_META[resultado] ?? RESULTADO_META.aprobado
  return (
    <span className={cn(base, m.cls, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', m.dot)} /> {m.label}
    </span>
  )
}

export function EstadoResultanteBadge({ estado, className }: { estado: EstadoResultante; className?: string }) {
  const m = ESTADO_RESULTANTE_META[estado] ?? ESTADO_RESULTANTE_META.operativo
  return <span className={cn(base, m.cls, className)}>{m.label}</span>
}

export function CriticidadBadge({ criticidad, className }: { criticidad: Criticidad; className?: string }) {
  const m = CRITICIDAD_META[criticidad] ?? CRITICIDAD_META.media
  return <span className={cn(base, m.cls, className)}>Criticidad {m.label}</span>
}

export function ItemEstadoBadge({ estado, className }: { estado: ItemEstado; className?: string }) {
  const m = ITEM_ESTADO_META[estado] ?? ITEM_ESTADO_META.conforme
  return <span className={cn(base, m.cls, className)}>{m.label}</span>
}

export function CertEstadoBadge({ estado, className }: { estado: string; className?: string }) {
  const map: Record<string, string> = {
    vigente: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    por_vencer: 'bg-amber-50 text-amber-700 border-amber-200',
    vencido: 'bg-red-50 text-red-700 border-red-200',
  }
  const label: Record<string, string> = { vigente: 'Vigente', por_vencer: 'Por vencer', vencido: 'Vencido' }
  return <span className={cn(base, map[estado] ?? map.vigente, className)}>{label[estado] ?? estado}</span>
}
