'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { assertPermissao } from '@/lib/auth'
import type { Cliente } from '@/types'

export async function getClientes(): Promise<Cliente[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data, error } = await supabase.from('clientes').select('*').order('nome')
  if (error) throw new Error(error.message)
  return data as Cliente[]
}

type ClienteInput = {
  nome: string
  tipo: string
  telefone: string
  email: string
  cidade: string
  estado: string
}

export async function criarCliente(input: ClienteInput) {
  await assertPermissao('clientes', 'criar')
  const supabase = await createClient()
  const { error } = await supabase.from('clientes').insert({
    nome: input.nome.trim(),
    tipo: input.tipo,
    telefone: input.telefone.trim() || null,
    email: input.email.trim() || null,
    cidade: input.cidade.trim() || null,
    estado: input.estado.trim() || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/clientes')
}

export async function atualizarCliente(id: string, input: ClienteInput) {
  await assertPermissao('clientes', 'editar')
  const supabase = await createClient()
  const { error } = await supabase
    .from('clientes')
    .update({
      nome: input.nome.trim(),
      tipo: input.tipo,
      telefone: input.telefone.trim() || null,
      email: input.email.trim() || null,
      cidade: input.cidade.trim() || null,
      estado: input.estado.trim() || null,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/clientes')
  revalidatePath('/vendas')
}

export async function deletarCliente(id: string) {
  await assertPermissao('clientes', 'deletar')
  const supabase = await createClient()

  const { data: uso } = await supabase
    .from('pedidos')
    .select('id')
    .eq('cliente_id', id)
    .limit(1)

  if (uso && uso.length > 0) {
    throw new Error('Este cliente possui pedidos vinculados e não pode ser excluído.')
  }

  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/clientes')
}
