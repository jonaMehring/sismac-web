import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from './AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Try to get profile from DB; fall back to auth metadata if DB query fails
  const { data: dbPerfil } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  const perfil = dbPerfil ?? {
    id: user.id,
    email: user.email ?? '',
    nombre: (user.user_metadata?.nombre as string) ?? user.email?.split('@')[0] ?? 'Usuario',
    apellido: null,
    rol: (user.user_metadata?.rol as string) ?? 'admin_sismac',
    activo: true,
    avatar_url: null,
    telefono: null,
    ultimo_acceso: null,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <AppShell user={perfil as any}>{children}</AppShell>
}
