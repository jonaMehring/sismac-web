'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0C1A47 0%, #0f2060 50%, #0C1A47 100%)' }}>

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] px-14 py-12"
        style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <Image
            src="/logo-sismac.png"
            alt="SISMAC"
            width={160}
            height={65}
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gestión integral<br />
            <span style={{ color: '#06B6D4' }}>sin límites.</span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Operaciones, finanzas y compliance en una sola plataforma diseñada para tu empresa.
          </p>
          <div className="flex gap-6 mt-10">
            {[
              { label: 'Módulos integrados', value: '4+' },
              { label: 'Tiempo real', value: '100%' },
              { label: 'Seguro', value: 'RLS' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/20 text-xs">© {new Date().getFullYear()} SISMAC. Todos los derechos reservados.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="bg-white rounded-2xl px-4 py-2 shadow-lg">
              <Image src="/logo-sismac.png" alt="SISMAC" width={120} height={50} className="object-contain" priority />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">Bienvenido</h2>
              <p className="text-sm text-slate-400 mt-1">Ingresá tus credenciales para continuar</p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="usuario@empresa.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all"
                  style={{ '--tw-ring-color': '#06B6D4' } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all"
                    style={{ '--tw-ring-color': '#06B6D4' } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all mt-2 disabled:opacity-70"
                style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0C1A47, #1e3a8a)', boxShadow: loading ? 'none' : '0 4px 14px rgba(13,27,75,0.4)' }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando...</>
                ) : 'Ingresar al sistema'}
              </button>
            </form>
          </div>

          <p className="text-center text-white/25 text-xs mt-6 lg:hidden">
            © {new Date().getFullYear()} SISMAC
          </p>
        </div>
      </div>
    </div>
  )
}
