import { redirect } from 'next/navigation'
import { getFacas } from '@/lib/actions/facas'
import { getPermissoesEfetivas } from '@/lib/auth'
import { FacasClient } from '@/components/facas/facas-client'

export const metadata = { title: 'Facas — Alma Campeira' }

export default async function FacasPage() {
  const perms = await getPermissoesEfetivas()
  if (!perms.facas.ver) redirect('/')

  const facas = await getFacas()
  return <FacasClient facas={facas} perm={perms.facas} />
}
