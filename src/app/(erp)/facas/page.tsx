import { getFacas } from '@/lib/actions/facas'
import { FacasClient } from '@/components/facas/facas-client'

export const metadata = { title: 'Facas — Alma Campeira' }

export default async function FacasPage() {
  const facas = await getFacas()
  return <FacasClient facas={facas} />
}
