'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { assertPermissao } from '@/lib/auth'
import type { Faca } from '@/types'

export async function getFacas(): Promise<Faca[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('facas')
    .select('*')
    .order('codigo')

  if (error) throw new Error(error.message)
  return data as Faca[]
}

export async function gerarCodigoFaca(): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('facas')
    .select('codigo')
    .order('codigo', { ascending: false })
    .limit(1)
    .single()

  if (!data) return 'FK-0001'
  const num = parseInt(data.codigo.replace('FK-', ''), 10)
  return `FK-${String(num + 1).padStart(4, '0')}`
}

type FacaInput = {
  nome: string
  categoria: string
  preco_venda: number
  estoque_atual: number
}

export async function criarFaca(input: FacaInput) {
  await assertPermissao('facas', 'criar')
  const supabase = await createClient()
  const codigo = await gerarCodigoFaca()

  const { error } = await supabase.from('facas').insert({
    codigo,
    nome: input.nome.trim(),
    categoria: input.categoria,
    preco_venda: input.preco_venda,
    estoque_atual: input.estoque_atual,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/facas')
}

export async function atualizarFaca(id: string, input: FacaInput) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('facas')
    .update({
      nome: input.nome.trim(),
      categoria: input.categoria,
      preco_venda: input.preco_venda,
      estoque_atual: input.estoque_atual,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/facas')
}

export async function deletarFaca(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('facas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/facas')
}
