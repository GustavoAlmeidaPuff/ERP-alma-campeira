'use server'

import { getPermissoesEfetivas } from '@/lib/auth'
import { getMatériasPrimas } from '@/lib/actions/materias-primas'
import { getFornecedores } from '@/lib/actions/fornecedores'
import { getFacas } from '@/lib/actions/facas'
import { getCategoriasFaca } from '@/lib/actions/categorias-faca'
import { getVendas } from '@/lib/actions/vendas'
import { getClientes } from '@/lib/actions/clientes'
import { getUsuarios } from '@/lib/actions/usuarios'
import { getCargos } from '@/lib/actions/cargos'
import { getFilaReposicao } from '@/lib/actions/ordens-compra'

import type { MateriaPrima, Fornecedor, Faca, CategoriaFacaDB, Pedido, Cliente, Usuario, Cargo } from '@/types'

type Perm = { ver: boolean; criar: boolean; editar: boolean; deletar: boolean }

export type ErpTabData =
  | {
      kind: 'materias-primas'
      materiasPrimas: MateriaPrima[]
      fornecedores: Fornecedor[]
      perm: Perm
    }
  | {
      kind: 'facas'
      facas: Faca[]
      categorias: CategoriaFacaDB[]
      perm: Perm
    }
  | {
      kind: 'fornecedores'
      fornecedores: Fornecedor[]
      perm: Perm
    }
  | {
      kind: 'ordens-compra'
      fila: Awaited<ReturnType<typeof getFilaReposicao>>
      perm: Perm
    }
  | {
      kind: 'vendas'
      pedidos: Pedido[]
      clientes: Cliente[]
      facas: Faca[]
      perm: Perm
    }
  | {
      kind: 'clientes'
      clientes: Cliente[]
      perm: Perm
    }
  | {
      kind: 'usuarios'
      usuarios: Usuario[]
      cargos: Cargo[]
      perm: Perm
    }
  | {
      kind: 'cargos'
      cargos: Cargo[]
      perm: Perm
    }
  | {
      kind: 'configuracoes'
      categorias: CategoriaFacaDB[]
    }

function assertAllowed(perm: Perm | undefined, label: string): void {
  if (!perm || !perm.ver) throw new Error(`Acesso negado: ${label}.`)
}

function normalizePathOnly(href: string) {
  const [pathOnly] = href.split('?')
  return pathOnly
}

export async function getErpTabData(href: string): Promise<ErpTabData> {
  const path = normalizePathOnly(href)

  const perms = await getPermissoesEfetivas()

  if (path === '/materias-primas') {
    const perm = perms.materias_primas as Perm
    assertAllowed(perm, 'materias_primas')
    const [materiasPrimas, fornecedores] = await Promise.all([getMatériasPrimas(120), getFornecedores(80)])
    return { kind: 'materias-primas', materiasPrimas, fornecedores, perm }
  }

  if (path === '/facas') {
    const perm = perms.facas as Perm
    assertAllowed(perm, 'facas')
    const [facas, categorias] = await Promise.all([getFacas(120), getCategoriasFaca()])
    return { kind: 'facas', facas, categorias, perm }
  }

  if (path === '/fornecedores') {
    const perm = perms.fornecedores as Perm
    assertAllowed(perm, 'fornecedores')
    const fornecedores = await getFornecedores(120)
    return { kind: 'fornecedores', fornecedores, perm }
  }

  if (path === '/ordens-compra') {
    const perm = perms.ordens_compra as Perm
    assertAllowed(perm, 'ordens_compra')
    const fila = await getFilaReposicao()
    return { kind: 'ordens-compra', fila, perm }
  }

  if (path === '/vendas') {
    const perm = perms.vendas as Perm
    assertAllowed(perm, 'vendas')
    const [pedidos, clientes, facas] = await Promise.all([getVendas(80), getClientes(80), getFacas(120)])
    return { kind: 'vendas', pedidos, clientes, facas, perm }
  }

  if (path === '/clientes') {
    const perm = perms.clientes as Perm
    assertAllowed(perm, 'clientes')
    const clientes = await getClientes(120)
    return { kind: 'clientes', clientes, perm }
  }

  if (path === '/usuarios') {
    const perm = perms.usuarios as Perm
    assertAllowed(perm, 'usuarios')
    const [usuarios, cargos] = await Promise.all([getUsuarios(120), getCargos(80)])
    return { kind: 'usuarios', usuarios, cargos, perm }
  }

  if (path === '/cargos') {
    const perm = perms.cargos as Perm
    assertAllowed(perm, 'cargos')
    const cargos = await getCargos(120)
    return { kind: 'cargos', cargos, perm }
  }

  if (path === '/configuracoes') {
    const categorias = await getCategoriasFaca()
    return { kind: 'configuracoes', categorias }
  }

  throw new Error(`Rota de aba não suportada: ${path}`)
}

