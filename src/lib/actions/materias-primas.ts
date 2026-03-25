'use server'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { assertPermissao } from '@/lib/auth'
import type { MateriaPrima } from '@/types'

const _cachedGetMatériasPrimas = unstable_cache(
  async (_userId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('materias_primas')
      .select('*, fornecedor:fornecedores(id, nome, telefone, email, created_at)')
      .order('codigo')
    if (error) throw new Error(error.message)
    return data as MateriaPrima[]
  },
  ['materias-primas'],
  { tags: ['materias-primas'] }
)

export async function getMatériasPrimas(): Promise<MateriaPrima[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  return _cachedGetMatériasPrimas(user.id)
}

export async function gerarCodigoMP(): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('materias_primas')
    .select('codigo')
    .order('codigo', { ascending: false })
    .limit(1)
    .single()

  if (!data) return 'MP-0001'
  const num = parseInt(data.codigo.replace('MP-', ''), 10)
  return `MP-${String(num + 1).padStart(4, '0')}`
}

type MPInput = {
  nome: string
  fornecedor_id: string | null
  preco_custo: number
  estoque_atual: number
  estoque_minimo: number
}

export async function criarMateriaPrima(input: MPInput) {
  await assertPermissao('materias_primas', 'criar')
  const supabase = await createClient()
  const codigo = await gerarCodigoMP()

  const { error } = await supabase.from('materias_primas').insert({
    codigo,
    nome: input.nome.trim(),
    fornecedor_id: input.fornecedor_id || null,
    preco_custo: input.preco_custo,
    estoque_atual: input.estoque_atual,
    estoque_minimo: input.estoque_minimo,
  })

  if (error) throw new Error(error.message)
  revalidateTag('materias-primas')
  revalidatePath('/materias-primas')
}

export async function atualizarMateriaPrima(id: string, input: MPInput) {
  await assertPermissao('materias_primas', 'editar')
  const supabase = await createClient()

  const { error } = await supabase
    .from('materias_primas')
    .update({
      nome: input.nome.trim(),
      fornecedor_id: input.fornecedor_id || null,
      preco_custo: input.preco_custo,
      estoque_atual: input.estoque_atual,
      estoque_minimo: input.estoque_minimo,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidateTag('materias-primas')
  revalidatePath('/materias-primas')
}

export async function deletarMateriaPrima(id: string) {
  await assertPermissao('materias_primas', 'deletar')
  const supabase = await createClient()

  const { data: uso } = await supabase
    .from('faca_materias_primas')
    .select('id')
    .eq('materia_prima_id', id)
    .limit(1)

  if (uso && uso.length > 0) {
    throw new Error('Esta matéria-prima está vinculada a uma ou mais facas e não pode ser excluída.')
  }

  const { error } = await supabase.from('materias_primas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidateTag('materias-primas')
  revalidatePath('/materias-primas')
}
