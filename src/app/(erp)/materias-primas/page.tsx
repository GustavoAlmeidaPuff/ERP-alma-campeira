import { getMatériasPrimas } from '@/lib/actions/materias-primas'
import { getFornecedores } from '@/lib/actions/fornecedores'
import { MPClient } from '@/components/materias-primas/mp-client'

export const metadata = { title: 'Matérias-Primas — Alma Campeira' }

export default async function MatériasPrimasPage() {
  const [materiasPrimas, fornecedores] = await Promise.all([
    getMatériasPrimas(),
    getFornecedores(),
  ])

  return <MPClient materiasPrimas={materiasPrimas} fornecedores={fornecedores} />
}
