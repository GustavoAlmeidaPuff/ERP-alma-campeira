import { redirect } from 'next/navigation'
import { getMatériasPrimas } from '@/lib/actions/materias-primas'
import { getFornecedores } from '@/lib/actions/fornecedores'
import { getPermissoesEfetivas } from '@/lib/auth'
import { MPClient } from '@/components/materias-primas/mp-client'

export const metadata = { title: 'Matérias-Primas — Alma Campeira' }

export default async function MatériasPrimasPage() {
  const perms = await getPermissoesEfetivas()
  if (!perms.materias_primas.ver) redirect('/')

  const [materiasPrimas, fornecedores] = await Promise.all([
    getMatériasPrimas(),
    getFornecedores(),
  ])

  return (
    <MPClient
      materiasPrimas={materiasPrimas}
      fornecedores={fornecedores}
      perm={perms.materias_primas}
    />
  )
}
