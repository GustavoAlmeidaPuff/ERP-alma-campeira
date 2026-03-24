import { getUsuarios } from '@/lib/actions/usuarios'
import { UsuariosClient } from '@/components/usuarios/usuarios-client'

export const metadata = { title: 'Usuários — Alma Campeira' }

export default async function UsuariosPage() {
  const usuarios = await getUsuarios()
  return <UsuariosClient usuarios={usuarios} />
}
