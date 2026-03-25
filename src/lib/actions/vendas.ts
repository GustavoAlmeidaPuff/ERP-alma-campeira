'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { assertPermissao } from '@/lib/auth'
import type { Pedido } from '@/types'

export async function getVendas(): Promise<Pedido[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      cliente:clientes(id, nome, tipo),
      itens:pedido_itens(*, faca:facas(id, codigo, nome, preco_venda))
    `)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data as Pedido[]
}

export async function gerarCodigoPedido(): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pedidos')
    .select('codigo')
    .order('codigo', { ascending: false })
    .limit(1)
    .single()

  if (!data) return 'PD-0001'
  const num = parseInt(data.codigo.replace('PD-', ''), 10)
  return `PD-${String(num + 1).padStart(4, '0')}`
}

export type VendaItemInput = {
  faca_id: string
  quantidade: number
  preco_unitario: number
}

export type VendaInput = {
  cliente_id: string | null
  data_pedido: string
  observacao: string
  itens: VendaItemInput[]
}

export async function criarVenda(input: VendaInput) {
  await assertPermissao('vendas', 'criar')
  const supabase = await createClient()

  if (input.itens.length === 0) throw new Error('Adicione ao menos um item ao pedido.')

  const codigo = await gerarCodigoPedido()
  const valor_total = input.itens.reduce((s, i) => s + i.quantidade * i.preco_unitario, 0)

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .insert({
      codigo,
      cliente_id: input.cliente_id || null,
      data_pedido: input.data_pedido,
      observacao: input.observacao.trim() || null,
      status: 'orcamento',
      valor_total,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  const { error: itemsError } = await supabase.from('pedido_itens').insert(
    input.itens.map((i) => ({
      pedido_id: pedido.id,
      faca_id: i.faca_id,
      quantidade: i.quantidade,
      preco_unitario: i.preco_unitario,
    }))
  )
  if (itemsError) throw new Error(itemsError.message)

  revalidatePath('/vendas')
}

export async function atualizarVenda(id: string, input: VendaInput) {
  await assertPermissao('vendas', 'editar')
  const supabase = await createClient()

  if (input.itens.length === 0) throw new Error('Adicione ao menos um item ao pedido.')

  const { data: pedido } = await supabase
    .from('pedidos')
    .select('status')
    .eq('id', id)
    .single()
  if (!pedido || pedido.status !== 'orcamento') {
    throw new Error('Apenas orçamentos podem ser editados.')
  }

  const valor_total = input.itens.reduce((s, i) => s + i.quantidade * i.preco_unitario, 0)

  const { error } = await supabase
    .from('pedidos')
    .update({
      cliente_id: input.cliente_id || null,
      data_pedido: input.data_pedido,
      observacao: input.observacao.trim() || null,
      valor_total,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)

  await supabase.from('pedido_itens').delete().eq('pedido_id', id)

  const { error: itemsError } = await supabase.from('pedido_itens').insert(
    input.itens.map((i) => ({
      pedido_id: id,
      faca_id: i.faca_id,
      quantidade: i.quantidade,
      preco_unitario: i.preco_unitario,
    }))
  )
  if (itemsError) throw new Error(itemsError.message)

  revalidatePath('/vendas')
}

export async function avancarStatus(id: string, novoStatus: 'confirmado' | 'em_producao') {
  await assertPermissao('vendas', 'editar')
  const supabase = await createClient()

  const { error } = await supabase
    .from('pedidos')
    .update({ status: novoStatus })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/vendas')
}

export async function marcarEntregue(id: string) {
  await assertPermissao('vendas', 'editar')
  const supabase = await createClient()

  const { data: pedido, error: pedidoErr } = await supabase
    .from('pedidos')
    .select('*, itens:pedido_itens(*)')
    .eq('id', id)
    .single()

  if (pedidoErr || !pedido) throw new Error('Pedido não encontrado.')
  if (pedido.status !== 'em_producao') throw new Error('O pedido precisa estar "Em Produção" para ser entregue.')

  const itens = pedido.itens as { faca_id: string; quantidade: number }[]

  const facaIds = [...new Set(itens.map((i) => i.faca_id))]
  const { data: facas } = await supabase
    .from('facas')
    .select('id, nome, estoque_atual')
    .in('id', facaIds)

  const facaMap = new Map((facas ?? []).map((f) => [f.id, f]))

  const insuficientes = itens.filter((item) => {
    const faca = facaMap.get(item.faca_id)
    return !faca || faca.estoque_atual < item.quantidade
  })

  if (insuficientes.length > 0) {
    const detalhes = insuficientes
      .map((item) => {
        const f = facaMap.get(item.faca_id)
        return `${f?.nome ?? 'Desconhecida'} (precisa ${item.quantidade}, tem ${f?.estoque_atual ?? 0})`
      })
      .join('; ')
    throw new Error(`Estoque insuficiente: ${detalhes}`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  const { error: upErr } = await supabase
    .from('pedidos')
    .update({ status: 'entregue', entregue_at: new Date().toISOString() })
    .eq('id', id)
  if (upErr) throw new Error(upErr.message)

  for (const item of itens) {
    const faca = facaMap.get(item.faca_id)!
    await supabase
      .from('facas')
      .update({ estoque_atual: faca.estoque_atual - item.quantidade })
      .eq('id', item.faca_id)

    await supabase.from('movimentacoes_estoque').insert({
      tipo: 'saida_venda',
      faca_id: item.faca_id,
      pedido_id: id,
      quantidade: item.quantidade,
      usuario_id: user?.id ?? null,
    })
  }

  const { data: boms } = await supabase
    .from('faca_materias_primas')
    .select('faca_id, materia_prima_id, quantidade, mp:materias_primas(id, fornecedor_id)')
    .in('faca_id', facaIds)

  for (const item of itens) {
    const facaBom = (boms ?? []).filter((b) => b.faca_id === item.faca_id)
    for (const bom of facaBom) {
      const mp = (Array.isArray(bom.mp) ? bom.mp[0] : bom.mp) as { id: string; fornecedor_id: string | null }
      await supabase.from('fila_reposicao').insert({
        materia_prima_id: bom.materia_prima_id,
        fornecedor_id: mp.fornecedor_id,
        quantidade_pendente: bom.quantidade * item.quantidade,
        pedido_id: id,
      })
    }
  }

  revalidatePath('/vendas')
  revalidatePath('/facas')
}

export async function cancelarVenda(id: string) {
  await assertPermissao('vendas', 'editar')
  const supabase = await createClient()

  const { data: pedido } = await supabase
    .from('pedidos')
    .select('status')
    .eq('id', id)
    .single()

  if (pedido?.status === 'entregue') {
    throw new Error('Pedidos já entregues não podem ser cancelados.')
  }

  const { error } = await supabase
    .from('pedidos')
    .update({ status: 'cancelado' })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/vendas')
}

export async function deletarVenda(id: string) {
  await assertPermissao('vendas', 'deletar')
  const supabase = await createClient()

  const { data: pedido } = await supabase
    .from('pedidos')
    .select('status')
    .eq('id', id)
    .single()

  if (pedido?.status !== 'orcamento') {
    throw new Error('Apenas orçamentos podem ser excluídos.')
  }

  const { error } = await supabase.from('pedidos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/vendas')
}
