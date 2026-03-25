import { redirect } from 'next/navigation'
import { getFacas } from '@/lib/actions/facas'
import { getCategoriasFaca } from '@/lib/actions/categorias-faca'
import { getPermissoesEfetivas } from '@/lib/auth'
import { FacasClient } from '@/components/facas/facas-client'

export const metadata = { title: 'Facas — Alma Campeira' }

export default async function FacasPage() {
  const perms = await getPermissoesEfetivas()
  if (!perms.facas.ver) redirect('/')

  const [facas, categorias] = await Promise.all([getFacas(), getCategoriasFaca()])
  return <FacasClient facas={facas} categorias={categorias} perm={perms.facas} />
}
