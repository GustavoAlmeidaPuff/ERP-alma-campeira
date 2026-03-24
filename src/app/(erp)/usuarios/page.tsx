import { getUsuarios } from '@/lib/actions/usuarios'
import { getCargos } from '@/lib/actions/cargos'
import { UsuariosClient } from '@/components/usuarios/usuarios-client'

export const metadata = { title: 'Usuários — Alma Campeira' }

export default async function UsuariosPage() {
  const [usuarios, cargos] = await Promise.all([getUsuarios(), getCargos()])
  return <UsuariosClient usuarios={usuarios} cargos={cargos} />
}
