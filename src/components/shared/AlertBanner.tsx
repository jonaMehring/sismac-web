'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AlertItem {
  id: string
  message: string
  href?: string
  severity: 'critical' | 'warning' | 'info'
}

interface AlertBannerProps {
  alerts: AlertItem[]
  className?: string
}

const SEVERITY_STYLES = {
  critical: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-orange-50 border-orange-200 text-orange-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

export function AlertBanner({ alerts, className }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = alerts.filter(a => !dismissed.has(a.id))
  if (visible.length === 0) return null

  return (
    <div className={cn('space-y-2 mb-6', className)}>
      {visible.map(alert => (
        <div
          key={alert.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium',
            SEVERITY_STYLES[alert.severity]
          )}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{alert.message}</span>
          {alert.href && (
            <Link href={alert.href} className="flex items-center gap-1 text-xs underline underline-offset-2 shrink-0">
              Ver <ChevronRight className="w-3 h-3" />
            </Link>
          )}
          <button onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}>
            <X className="w-4 h-4 shrink-0 opacity-60 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  )
}
