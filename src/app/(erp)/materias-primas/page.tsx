import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getMatériasPrimas } from '@/lib/actions/materias-primas'
import { getFornecedores } from '@/lib/actions/fornecedores'
import { getPermissoesEfetivas } from '@/lib/auth'
import { MPClient } from '@/components/materias-primas/mp-client'
import { PageShellFallback, PageShellTitle } from '@/components/layout/page-shell'

export const metadata = { title: 'Matérias-Primas — Alma Campeira' }

export default async function MatériasPrimasPage() {
  return (
    <>
      <PageShellTitle title="Matérias-Primas" subtitle="Carregando matérias-primas e fornecedores..." />
      <Suspense fallback={<PageShellFallback />}>
        <MateriasPrimasPageData />
      </Suspense>
    </>
  )
}

async function MateriasPrimasPageData() {
  const perms = await getPermissoesEfetivas()
  if (!perms.materias_primas.ver) redirect('/')
  const [materiasPrimas, fornecedores] = await Promise.all([
    getMatériasPrimas(120),
    getFornecedores(80),
  ])

  return (
    <MPClient
      materiasPrimas={materiasPrimas}
      fornecedores={fornecedores}
      perm={perms.materias_primas}
    />
  )
}
