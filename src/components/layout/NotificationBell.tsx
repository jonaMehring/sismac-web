'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils/cn'
import { formatRelative } from '@/lib/utils/dates'
import type { NotificationType } from '@/lib/types'

const TIPO_COLORS: Partial<Record<NotificationType, string>> = {
  documento_vencido: 'bg-red-100 text-red-600',
  documento_por_vencer: 'bg-orange-100 text-orange-600',
  factura_vencida: 'bg-red-100 text-red-600',
  factura_por_vencer: 'bg-orange-100 text-orange-600',
  tarea_demorada: 'bg-yellow-100 text-yellow-600',
  tarea_asignada: 'bg-blue-100 text-blue-600',
  presupuesto_aprobado: 'bg-green-100 text-green-600',
  presupuesto_rechazado: 'bg-red-100 text-red-600',
  gasto_aprobado: 'bg-green-100 text-green-600',
}

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(userId)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 flex flex-col max-h-[480px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">{unreadCount}</span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Marcar todas como leídas"
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Sin notificaciones</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={cn(
                      'flex gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors',
                      !notif.leida && 'bg-blue-50/50'
                    )}
                  >
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-2 shrink-0',
                      TIPO_COLORS[notif.tipo as NotificationType] ?? 'bg-slate-300'
                    ).split(' ')[0]} />
                    <div className="flex-1 min-w-0">
                      {notif.accion_url ? (
                        <Link
                          href={notif.accion_url}
                          onClick={() => { markRead(notif.id); setOpen(false) }}
                          className="block"
                        >
                          <p className="text-sm font-medium text-slate-800 truncate">{notif.titulo}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.mensaje}</p>
                          <p className="text-xs text-slate-400 mt-1">{formatRelative(notif.created_at)}</p>
                        </Link>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-800">{notif.titulo}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{notif.mensaje}</p>
                          <p className="text-xs text-slate-400 mt-1">{formatRelative(notif.created_at)}</p>
                        </>
                      )}
                    </div>
                    {!notif.leida && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="shrink-0 p-1 rounded text-slate-400 hover:text-blue-600"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
