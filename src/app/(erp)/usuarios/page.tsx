import { redirect } from 'next/navigation'
import { getUsuarios } from '@/lib/actions/usuarios'
import { getCargos } from '@/lib/actions/cargos'
import { getPermissoesEfetivas } from '@/lib/auth'
import { UsuariosClient } from '@/components/usuarios/usuarios-client'

export const metadata = { title: 'Usuários — Alma Campeira' }

export default async function UsuariosPage() {
  const perms = await getPermissoesEfetivas()
  if (!perms.usuarios.ver) redirect('/')

  const [usuarios, cargos] = await Promise.all([getUsuarios(), getCargos()])
  return <UsuariosClient usuarios={usuarios} cargos={cargos} perm={perms.usuarios} />
}
