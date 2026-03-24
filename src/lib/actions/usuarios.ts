'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { Usuario, PerfilUsuario } from '@/types'

export async function getUsuarios(): Promise<Usuario[]> {
  const admin = createAdminClient()

  // Busca todos os usuários do Auth
  const { data: authData, error: authError } = await admin.auth.admin.listUsers()
  if (authError) throw new Error(authError.message)

  // Busca os perfis
  const supabase = await createClient()
  const { data: perfis } = await supabase.from('usuarios_perfis').select('*')

  const perfisMap = new Map((perfis ?? []).map((p) => [p.id, p]))

  return authData.users.map((user) => {
    const perfil = perfisMap.get(user.id)
    return {
      id: user.id,
      email: user.email ?? '',
      nome: perfil?.nome ?? user.email?.split('@')[0] ?? '',
      perfil: perfil?.perfil ?? 'vendas',
      ativo: perfil?.ativo ?? true,
      created_at: user.created_at,
    }
  })
}

export async function criarUsuario({
  email,
  senha,
  nome,
  perfil,
}: {
  email: string
  senha: string
  nome: string
  perfil: PerfilUsuario
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
    perfil,
    ativo: true,
  })

  if (perfilError) throw new Error(perfilError.message)
  revalidatePath('/usuarios')
}

export async function atualizarPerfil(
  id: string,
  { nome, perfil, ativo }: { nome: string; perfil: PerfilUsuario; ativo: boolean }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('usuarios_perfis')
    .upsert({ id, nome: nome.trim(), perfil, ativo })

  if (error) throw new Error(error.message)
  revalidatePath('/usuarios')
}

export async function deletarUsuario(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) throw new Error(error.message)
  revalidatePath('/usuarios')
}
