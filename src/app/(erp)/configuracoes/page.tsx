import { Suspense } from 'react'
import { ConfiguracoesClient } from '@/components/configuracoes/configuracoes-client'
import { getCategoriasFaca } from '@/lib/actions/categorias-faca'
import { PageShellFallback, PageShellTitle } from '@/components/layout/page-shell'

export const metadata = { title: 'Configurações — Alma Campeira' }

export default async function ConfiguracoesPage() {
  return (
    <>
      <PageShellTitle title="Configurações" subtitle="Carregando preferências do sistema..." />
      <Suspense fallback={<PageShellFallback />}>
        <ConfiguracoesPageData />
      </Suspense>
    </>
  )
}

async function ConfiguracoesPageData() {
  const categorias = await getCategoriasFaca()
  return <ConfiguracoesClient categorias={categorias} />
}
