'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Fornecedor } from '@/types'

export async function getFornecedores(): Promise<Fornecedor[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .order('nome')

  if (error) throw new Error(error.message)
  return data as Fornecedor[]
}

type FornecedorInput = {
  nome: string
  telefone: string
  email: string
}

export async function criarFornecedor(input: FornecedorInput) {
  const supabase = await createClient()
  const { error } = await supabase.from('fornecedores').insert({
    nome: input.nome.trim(),
    telefone: input.telefone.trim() || null,
    email: input.email.trim() || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/fornecedores')
}

export async function atualizarFornecedor(id: string, input: FornecedorInput) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('fornecedores')
    .update({
      nome: input.nome.trim(),
      telefone: input.telefone.trim() || null,
      email: input.email.trim() || null,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/fornecedores')
}

export async function deletarFornecedor(id: string) {
  const supabase = await createClient()

  const { data: uso } = await supabase
    .from('materias_primas')
    .select('id')
    .eq('fornecedor_id', id)
    .limit(1)

  if (uso && uso.length > 0) {
    throw new Error('Este fornecedor possui matérias-primas vinculadas e não pode ser excluído.')
  }

  const { error } = await supabase.from('fornecedores').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/fornecedores')
}
