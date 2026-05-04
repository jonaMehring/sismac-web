import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppShell } from './AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Use service-role client to bypass RLS — the user is already authenticated above
  const admin = createAdminClient()
  const { data: perfil } = await admin
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil) {
    redirect('/api/auth/signout')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <AppShell user={perfil as any}>{children}</AppShell>
}
