import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Users, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils/dates'
import { USER_ROLE_LABELS, type Usuario } from '@/lib/types'
import { ToggleUserForm } from '@/components/admin/ToggleUserForm'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  if (!perfil || perfil.rol !== 'admin_sismac') redirect('/dashboard')

  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('*')
    .order('nombre')

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Gestión de accesos y roles del sistema"
        icon={Users}
        iconColor="bg-slate-700"
        actions={
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
            <Users className="w-4 h-4" />
            Los usuarios se crean desde Supabase Auth
          </div>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Usuario</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Rol</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Último acceso</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {(usuarios as unknown as Usuario[] ?? []).map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-600">{u.nombre?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="font-medium text-slate-800">{u.nombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                    {USER_ROLE_LABELS[u.rol as keyof typeof USER_ROLE_LABELS] ?? u.rol}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                  {u.ultimo_acceso ? formatDate(u.ultimo_acceso) : 'Nunca'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id !== user.id && (
                    <ToggleUserForm userId={u.id} activo={u.activo} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
