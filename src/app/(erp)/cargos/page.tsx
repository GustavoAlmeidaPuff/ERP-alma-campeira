import { redirect } from 'next/navigation'
import { getCargos } from '@/lib/actions/cargos'
import { getPermissoesEfetivas } from '@/lib/auth'
import { CargosClient } from '@/components/cargos/cargos-client'

export const metadata = { title: 'Cargos — Alma Campeira' }

export default async function CargosPage() {
  const perms = await getPermissoesEfetivas()
  if (!perms.cargos.ver) redirect('/')

  const cargos = await getCargos()
  return <CargosClient cargos={cargos} perm={perms.cargos} />
}
