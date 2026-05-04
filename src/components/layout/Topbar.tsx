'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, LogOut, User, ChevronDown, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from './NotificationBell'
import { cn } from '@/lib/utils/cn'
import type { Usuario } from '@/lib/types'

const ROLE_LABELS: Record<string, string> = {
  admin_sismac: 'Administrador',
  admin_financiero: 'Admin Financiero',
  supervisor_bpm: 'Supervisor',
  operario: 'Operario',
  cliente: 'Cliente',
}

const ROLE_COLORS: Record<string, string> = {
  admin_sismac: 'bg-indigo-100 text-indigo-700',
  admin_financiero: 'bg-emerald-100 text-emerald-700',
  supervisor_bpm: 'bg-amber-100 text-amber-700',
  operario: 'bg-sky-100 text-sky-700',
  cliente: 'bg-slate-100 text-slate-600',
}

interface TopbarProps {
  user: Usuario
  onMenuToggle: () => void
}

export function Topbar({ user, onMenuToggle }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const initials = user.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase()

  const roleLabel = ROLE_LABELS[user.rol] ?? user.rol
  const roleColor = ROLE_COLORS[user.rol] ?? 'bg-slate-100 text-slate-600'

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 shrink-0"
      style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden lg:block">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            {process.env.NEXT_PUBLIC_APP_NAME ?? 'SISMAC'}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <NotificationBell userId={user.id} />

        {/* User dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-colors',
              dropdownOpen ? 'bg-slate-100' : 'hover:bg-slate-50'
            )}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #06b6d4)' }}>
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user.nombre}</p>
              <p className="text-xs text-slate-400 leading-tight">{roleLabel}</p>
            </div>
            <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200', dropdownOpen && 'rotate-180')} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-40 animate-slide-up">
                {/* User info */}
                <div className="px-4 py-3 border-b border-slate-50">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1e3a8a, #06b6d4)' }}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{user.nombre}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[140px]">{user.email}</p>
                    </div>
                  </div>
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', roleColor)}>
                    {roleLabel}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    href="/perfil"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Mi perfil
                  </Link>
                  <Link
                    href="/admin/usuarios"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Configuración
                  </Link>
                </div>

                <div className="border-t border-slate-50 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
