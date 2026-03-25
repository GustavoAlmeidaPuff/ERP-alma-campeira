import { redirect } from 'next/navigation'
import { getPermissoesEfetivas } from '@/lib/auth'
import { getFilaReposicao, getOrdensCompra } from '@/lib/actions/ordens-compra'
import { OcClient } from '@/components/ordens-compra/oc-client'

export const metadata = { title: 'Ordens de Compra — Alma Campeira' }

export default async function OrdensCompraPage() {
  const perms = await getPermissoesEfetivas()
  if (!perms.ordens_compra.ver) redirect('/')

  const [fila, ordens] = await Promise.all([
    getFilaReposicao(),
    getOrdensCompra(),
  ])

  return (
    <OcClient
      fila={fila}
      ordens={ordens}
      perm={perms.ordens_compra}
    />
  )
}
