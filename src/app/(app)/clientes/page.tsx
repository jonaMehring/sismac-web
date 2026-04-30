import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Building2, Plus, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { Cliente } from '@/lib/types'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .eq('activo', true)
    .order('nombre')

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gestión de clientes y sus datos"
        icon={Building2}
        iconColor="bg-indigo-600"
        actions={
          <Link href="/clientes/nuevo" className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
            <Plus className="w-4 h-4" />
            Nuevo cliente
          </Link>
        }
      />

      {(clientes ?? []).length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Sin clientes"
          description="Crea el primer cliente para comenzar"
          action={
            <Link href="/clientes/nuevo" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Nuevo cliente
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(clientes as unknown as Cliente[]).map(c => (
            <Link
              key={c.id}
              href={`/clientes/${c.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center shrink-0">
                  {c.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{c.nombre}</h3>
                  {c.razon_social && <p className="text-xs text-slate-400 truncate">{c.razon_social}</p>}
                  {c.cuit && <p className="text-xs text-slate-400">CUIT: {c.cuit}</p>}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {c.email && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.telefono && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{c.telefono}</span>
                  </div>
                )}
              </div>
              <div className={cn(
                'mt-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                c.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              )}>
                {c.activo ? 'Activo' : 'Inactivo'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
