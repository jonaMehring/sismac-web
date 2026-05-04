'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, LogOut, User, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from './NotificationBell'
import type { Usuario } from '@/lib/types'

const ROLE_LABELS: Record<string, string> = {
  admin_sismac: 'Administrador',
  admin_financiero: 'Admin Financiero',
  supervisor_bpm: 'Supervisor',
  operario: 'Operario',
  cliente: 'Cliente',
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

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
      {/* Left: menu toggle + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden lg:block">
          <h1 className="text-sm font-semibold text-slate-800">{process.env.NEXT_PUBLIC_APP_NAME ?? 'SISMAC'}</h1>
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2">
        <NotificationBell userId={user.id} />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-800 leading-none">{user.nombre}</p>
              <p className="text-xs text-slate-500 mt-0.5">{ROLE_LABELS[user.rol] ?? user.rol}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-800">{user.nombre}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <Link
                href="/perfil"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4" />
                Mi perfil
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
