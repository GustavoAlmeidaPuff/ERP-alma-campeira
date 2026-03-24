import { getCargos } from '@/lib/actions/cargos'
import { CargosClient } from '@/components/cargos/cargos-client'

export const metadata = { title: 'Cargos — Alma Campeira' }

export default async function CargosPage() {
  const cargos = await getCargos()
  return <CargosClient cargos={cargos} />
}
