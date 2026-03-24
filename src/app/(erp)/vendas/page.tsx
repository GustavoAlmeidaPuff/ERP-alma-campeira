import { redirect } from 'next/navigation'
import { getVendas } from '@/lib/actions/vendas'
import { getClientes } from '@/lib/actions/clientes'
import { getFacas } from '@/lib/actions/facas'
import { getPermissoesEfetivas } from '@/lib/auth'
import { VendasClient } from '@/components/vendas/vendas-client'

export const metadata = { title: 'Vendas — Alma Campeira' }

export default async function VendasPage() {
  const perms = await getPermissoesEfetivas()
  if (!perms.vendas.ver) redirect('/')

  const [pedidos, clientes, facas] = await Promise.all([
    getVendas(),
    getClientes(),
    getFacas(),
  ])

  return (
    <VendasClient
      pedidos={pedidos}
      clientes={clientes}
      facas={facas}
      perm={perms.vendas}
    />
  )
}
