import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getVendas } from '@/lib/actions/vendas'
import { getClientes } from '@/lib/actions/clientes'
import { getFacas } from '@/lib/actions/facas'
import { getPermissoesEfetivas } from '@/lib/auth'
import { VendasClient } from '@/components/vendas/vendas-client'
import { PageShellFallback, PageShellTitle } from '@/components/layout/page-shell'

export const metadata = { title: 'Vendas — Alma Campeira' }

export default async function VendasPage() {
  return (
    <>
      <PageShellTitle title="Vendas" subtitle="Carregando dados de vendas..." />
      <Suspense fallback={<PageShellFallback />}>
        <VendasPageData />
      </Suspense>
    </>
  )
}

async function VendasPageData() {
  const perms = await getPermissoesEfetivas()
  if (!perms.vendas.ver) redirect('/')
  const [pedidos, clientes, facas] = await Promise.all([
    getVendas(80),
    getClientes(80),
    getFacas(120),
  ])

  return (
    <div data-nav-content-ready="Vendas">
      <VendasClient
        pedidos={pedidos}
        clientes={clientes}
        facas={facas}
        perm={perms.vendas}
      />
    </div>
  )
}
