'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleUserActive } from '@/app/actions/admin'

interface Props {
  userId: string
  activo: boolean
}

export function ToggleUserForm({ userId, activo }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleUserActive(userId, !activo)
        router.refresh()
      } catch {
        // silently ignore permission errors
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
        activo
          ? 'border-red-200 text-red-600 hover:bg-red-50'
          : 'border-green-200 text-green-600 hover:bg-green-50'
      }`}
    >
      {activo ? 'Desactivar' : 'Activar'}
    </button>
  )
}
