'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { Usuario, PerfilUsuario } from '@/types'

export async function getUsuarios(): Promise<Usuario[]> {
  const admin = createAdminClient()
  const { data: authData, error: authError } = await admin.auth.admin.listUsers()
  if (authError) throw new Error(authError.message)

  const supabase = await createClient()
  const { data: perfis } = await supabase
    .from('usuarios_perfis')
    .select('*, cargo:cargos(id, nome, cor)')

  const perfisMap = new Map((perfis ?? []).map((p) => [p.id, p]))

  return authData.users.map((user) => {
    const perfil = perfisMap.get(user.id)
    return {
      id: user.id,
      email: user.email ?? '',
      nome: perfil?.nome ?? user.email?.split('@')[0] ?? '',
      perfil: (perfil?.perfil ?? 'vendas') as PerfilUsuario,
      ativo: perfil?.ativo ?? true,
      cargo_id: perfil?.cargo_id ?? null,
      cargo: perfil?.cargo ?? null,
      created_at: user.created_at,
    }
  })
}

export async function criarUsuario({
  email, senha, nome, cargo_id,
}: {
  email: string
  senha: string
  nome: string
  cargo_id: string | null
}) {
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Usuário não criado.')

  const supabase = await createClient()
  const { error: perfilError } = await supabase.from('usuarios_perfis').insert({
    id: data.user.id,
    nome: nome.trim(),
    perfil: 'vendas', // valor legado, cargo_id é o que vale
    ativo: true,
    cargo_id: cargo_id || null,
  })
  if (perfilError) throw new Error(perfilError.message)
  revalidatePath('/usuarios')
}

export async function atualizarPerfil(
  id: string,
  { nome, ativo, cargo_id }: { nome: string; ativo: boolean; cargo_id: string | null }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('usuarios_perfis')
    .upsert({ id, nome: nome.trim(), perfil: 'vendas', ativo, cargo_id: cargo_id || null })
  if (error) throw new Error(error.message)
  revalidatePath('/usuarios')
}

export async function deletarUsuario(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) throw new Error(error.message)
  revalidatePath('/usuarios')
}
