import { getFornecedores } from '@/lib/actions/fornecedores'
import { FornecedoresClient } from '@/components/fornecedores/fornecedores-client'

export const metadata = { title: 'Fornecedores — Alma Campeira' }

export default async function FornecedoresPage() {
  const fornecedores = await getFornecedores()
  return <FornecedoresClient fornecedores={fornecedores} />
}
