'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, Activity, Layers, Lock } from 'lucide-react'

const DEMO_EMAIL = 'admin@gmail.com'
const DEMO_PASSWORD = 'admin123'

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

    // Validación de credenciales de la muestra
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError('')
  }

  return (
    <div className="min-h-screen flex brand-surface">

      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] px-14 py-12 relative overflow-hidden"
        style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Grid decorativo */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)' }} />

        <div className="relative">
          <Logo variant="light" markSize={42} showTagline />
        </div>

        <div className="relative">
          <h1 className="text-[2.6rem] font-bold text-white leading-[1.1] mb-4 tracking-tight">
            Gestión integral<br />
            <span className="gradient-text">para tu ingeniería.</span>
          </h1>
          <p className="text-white/55 text-base leading-relaxed max-w-md">
            Operaciones, finanzas y compliance en una sola plataforma, con trazabilidad total y control en tiempo real.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-10 max-w-md">
            {[
              { icon: Layers, label: 'Módulos integrados', value: '5' },
              { icon: Activity, label: 'Tiempo real', value: '100%' },
              { icon: ShieldCheck, label: 'Auditoría', value: 'RLS' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl px-4 py-4 border border-white/10 bg-white/[0.04]">
                <s.icon className="w-4 h-4 text-[#38BDF8] mb-2.5" />
                <p className="text-xl font-bold text-white leading-none">{s.value}</p>
                <p className="text-[0.68rem] text-white/45 mt-1.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/25 text-xs">© {new Date().getFullYear()} Ingesar. Todos los derechos reservados.</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[410px]">

          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo variant="light" markSize={40} />
          </div>

          <div className="bg-white rounded-[26px] p-8 sm:p-9" style={{ boxShadow: '0 30px 70px rgba(0,0,0,0.35)' }}>
            <div className="mb-7">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 lg:hidden">
                <LogoMark size={44} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido de nuevo</h2>
              <p className="text-sm text-slate-400 mt-1">Ingresá tus credenciales para continuar</p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm border border-red-100 animate-slide-up">
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white focus:border-transparent text-sm transition-all"
                  style={{ '--tw-ring-color': '#2563EB' } as React.CSSProperties}
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
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white focus:border-transparent text-sm transition-all"
                    style={{ '--tw-ring-color': '#2563EB' } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-brand w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl mt-2 disabled:opacity-70"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando...</>
                ) : 'Ingresar al sistema'}
              </button>
            </form>

            {/* Acceso de demostración */}
            <button
              onClick={fillDemo}
              type="button"
              className="w-full mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-left hover:border-blue-300 hover:bg-blue-50/40 transition-colors group"
            >
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Lock className="w-4 h-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-slate-700">Acceso de demostración</span>
                <span className="block text-xs text-slate-400 truncate">admin@gmail.com · admin123 — tocá para autocompletar</span>
              </span>
            </button>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            © {new Date().getFullYear()} Ingesar · Sistema de Gestión Integral
          </p>
        </div>
      </div>
    </div>
  )
}
