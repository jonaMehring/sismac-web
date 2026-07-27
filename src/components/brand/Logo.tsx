import { cn } from '@/lib/utils/cn'

/**
 * Marca Ingesar — isotipo geométrico de inspiración estructural/ingeniería.
 * Un nodo hexagonal con una viga diagonal, en degradé azul.
 */
export function LogoMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ingesar"
    >
      <defs>
        <linearGradient id="ingesar-mark" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#0A2540" />
        </linearGradient>
      </defs>
      {/* Placa redondeada */}
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#ingesar-mark)" />
      {/* Nodo hexagonal (estructura) */}
      <path
        d="M24 11.5l9.53 5.5v11L24 33.5l-9.53-5.5v-11L24 11.5z"
        stroke="#38BDF8"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
        opacity="0.55"
      />
      {/* Viga diagonal + monograma I */}
      <path d="M17 30.5L31 15.5" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="17" cy="30.5" r="2.6" fill="#FFFFFF" />
      <circle cx="31" cy="15.5" r="2.6" fill="#FFFFFF" />
      <rect x="22.7" y="19" width="2.6" height="11" rx="1.3" fill="#FFFFFF" />
    </svg>
  )
}

interface LogoProps {
  className?: string
  markSize?: number
  /** 'light' para fondos oscuros (texto blanco), 'dark' para fondos claros */
  variant?: 'light' | 'dark'
  showTagline?: boolean
}

/**
 * Logo completo: isotipo + logotipo "Ingesar".
 */
export function Logo({ className, markSize = 34, variant = 'dark', showTagline = false }: LogoProps) {
  const wordColor = variant === 'light' ? 'text-white' : 'text-[#0A2540]'
  const taglineColor = variant === 'light' ? 'text-white/45' : 'text-slate-400'

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={markSize} />
      <span className="flex flex-col leading-none">
        <span className={cn('font-extrabold tracking-tight text-[1.35rem]', wordColor)}>
          Inge<span className="text-[#38BDF8]">sar</span>
        </span>
        {showTagline && (
          <span className={cn('text-[0.6rem] font-semibold uppercase tracking-[0.22em] mt-1', taglineColor)}>
            Ingeniería &amp; Gestión
          </span>
        )}
      </span>
    </span>
  )
}
