import { cn } from '@/lib/utils/cn'
import {
  TASK_STATUS_LABELS, TASK_STATUS_COLORS,
  PRIORITY_LABELS, PRIORITY_COLORS,
  INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS,
  BUDGET_STATUS_LABELS, DOCUMENT_STATUS_LABELS, DOCUMENT_STATUS_COLORS,
  type TaskStatus, type TaskPriority, type InvoiceStatus, type BudgetStatus, type DocumentStatus
} from '@/lib/types'

interface BadgeProps { className?: string }

export function TaskStatusBadge({ status, className }: { status: TaskStatus } & BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', TASK_STATUS_COLORS[status], className)}>
      {TASK_STATUS_LABELS[status]}
    </span>
  )
}

export function PriorityBadge({ priority, className }: { priority: TaskPriority } & BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', PRIORITY_COLORS[priority], className)}>
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

export function InvoiceStatusBadge({ status, className }: { status: InvoiceStatus } & BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', INVOICE_STATUS_COLORS[status], className)}>
      {INVOICE_STATUS_LABELS[status]}
    </span>
  )
}

export function BudgetStatusBadge({ status, className }: { status: BudgetStatus } & BadgeProps) {
  const colors: Record<BudgetStatus, string> = {
    borrador: 'bg-slate-100 text-slate-600',
    enviado: 'bg-blue-100 text-blue-600',
    aprobado: 'bg-green-100 text-green-600',
    rechazado: 'bg-red-100 text-red-600',
    vencido: 'bg-gray-100 text-gray-500',
    convertido: 'bg-purple-100 text-purple-600',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colors[status], className)}>
      {BUDGET_STATUS_LABELS[status]}
    </span>
  )
}

export function DocumentStatusBadge({ status, className }: { status: DocumentStatus } & BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', DOCUMENT_STATUS_COLORS[status], className)}>
      {DOCUMENT_STATUS_LABELS[status]}
    </span>
  )
}

export function VencimientoBadge({ dias, className }: { dias: number } & BadgeProps) {
  const color = dias < 0 ? 'bg-red-100 text-red-700'
    : dias <= 7 ? 'bg-orange-100 text-orange-700'
    : dias <= 15 ? 'bg-yellow-100 text-yellow-700'
    : dias <= 30 ? 'bg-amber-100 text-amber-700'
    : 'bg-green-100 text-green-700'

  const label = dias < 0 ? `Vencido hace ${Math.abs(dias)}d`
    : dias === 0 ? 'Vence hoy'
    : `${dias}d restantes`

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', color, className)}>
      {label}
    </span>
  )
}
