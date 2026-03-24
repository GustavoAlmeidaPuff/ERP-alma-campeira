import { redirect } from 'next/navigation'
import { getFornecedores } from '@/lib/actions/fornecedores'
import { getPermissoesEfetivas } from '@/lib/auth'
import { FornecedoresClient } from '@/components/fornecedores/fornecedores-client'

export const metadata = { title: 'Fornecedores — Alma Campeira' }

export default async function FornecedoresPage() {
  const perms = await getPermissoesEfetivas()
  if (!perms.fornecedores.ver) redirect('/')

  const fornecedores = await getFornecedores()
  return <FornecedoresClient fornecedores={fornecedores} perm={perms.fornecedores} />
}
