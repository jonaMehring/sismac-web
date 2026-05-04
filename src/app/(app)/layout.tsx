import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from './AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil || perfilError) {
    // Redirect to route handler that clears cookies — can't set cookies from Server Component
    redirect('/api/auth/signout')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <AppShell user={perfil as any}>{children}</AppShell>
}
