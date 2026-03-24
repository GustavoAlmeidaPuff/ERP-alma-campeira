'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Cargo, CargoPermissao, ModuloKey } from '@/types'
import { MODULOS } from '@/types'

export async function getCargos(): Promise<Cargo[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cargos')
    .select('*, permissoes:cargo_permissoes(*)')
    .order('nome')

  if (error) throw new Error(error.message)
  return data as Cargo[]
}

type CargoInput = {
  nome: string
  descricao: string
  cor: string
  permissoes: Record<ModuloKey, { ver: boolean; criar: boolean; editar: boolean; deletar: boolean }>
}

export async function criarCargo(input: CargoInput) {
  const supabase = await createClient()

  const { data: cargo, error } = await supabase
    .from('cargos')
    .insert({ nome: input.nome.trim(), descricao: input.descricao.trim() || null, cor: input.cor })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  const permissoes = MODULOS.map((m) => ({
    cargo_id: cargo.id,
    modulo: m.key,
    ...input.permissoes[m.key],
  }))

  const { error: permError } = await supabase.from('cargo_permissoes').insert(permissoes)
  if (permError) throw new Error(permError.message)

  revalidatePath('/cargos')
  revalidatePath('/usuarios')
}

export async function atualizarCargo(id: string, input: CargoInput) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cargos')
    .update({ nome: input.nome.trim(), descricao: input.descricao.trim() || null, cor: input.cor })
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Upsert de todas as permissões
  const permissoes = MODULOS.map((m) => ({
    cargo_id: id,
    modulo: m.key,
    ...input.permissoes[m.key],
  }))

  const { error: permError } = await supabase
    .from('cargo_permissoes')
    .upsert(permissoes, { onConflict: 'cargo_id,modulo' })

  if (permError) throw new Error(permError.message)

  revalidatePath('/cargos')
  revalidatePath('/usuarios')
}

export async function deletarCargo(id: string) {
  const supabase = await createClient()

  const { data: uso } = await supabase
    .from('usuarios_perfis')
    .select('id')
    .eq('cargo_id', id)
    .limit(1)

  if (uso && uso.length > 0) {
    throw new Error('Este cargo está sendo usado por um ou mais usuários.')
  }

  const { error } = await supabase.from('cargos').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/cargos')
}

export function permissoesVazias(): Record<ModuloKey, { ver: boolean; criar: boolean; editar: boolean; deletar: boolean }> {
  return Object.fromEntries(
    MODULOS.map((m) => [m.key, { ver: false, criar: false, editar: false, deletar: false }])
  ) as Record<ModuloKey, { ver: boolean; criar: boolean; editar: boolean; deletar: boolean }>
}

export function permissoesFromArray(
  arr: CargoPermissao[]
): Record<ModuloKey, { ver: boolean; criar: boolean; editar: boolean; deletar: boolean }> {
  const base = permissoesVazias()
  for (const p of arr) {
    base[p.modulo] = { ver: p.ver, criar: p.criar, editar: p.editar, deletar: p.deletar }
  }
  return base
}
