import { ConfiguracoesClient } from '@/components/configuracoes/configuracoes-client'
import { getCategoriasFaca } from '@/lib/actions/categorias-faca'

export const metadata = { title: 'Configurações — Alma Campeira' }

export default async function ConfiguracoesPage() {
  const categorias = await getCategoriasFaca()
  return <ConfiguracoesClient categorias={categorias} />
}
