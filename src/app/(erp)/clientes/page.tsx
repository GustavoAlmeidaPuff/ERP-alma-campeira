import { redirect } from 'next/navigation'
import { getClientes } from '@/lib/actions/clientes'
import { getPermissoesEfetivas } from '@/lib/auth'
import { ClientesClient } from '@/components/clientes/clientes-client'

export const metadata = { title: 'Clientes — Alma Campeira' }

export default async function ClientesPage() {
  const perms = await getPermissoesEfetivas()
  if (!perms.clientes.ver) redirect('/')

  const clientes = await getClientes()
  return <ClientesClient clientes={clientes} perm={perms.clientes} />
}
