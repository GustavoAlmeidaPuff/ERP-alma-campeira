import type { CargoPermissao, ModuloKey } from '@/types'
import { MODULOS } from '@/types'

export type PermMap = Record<ModuloKey, { ver: boolean; criar: boolean; editar: boolean; deletar: boolean }>

export function permissoesVazias(): PermMap {
  return Object.fromEntries(
    MODULOS.map((m) => [m.key, { ver: false, criar: false, editar: false, deletar: false }])
  ) as PermMap
}

export function permissoesFromArray(arr: CargoPermissao[]): PermMap {
  const base = permissoesVazias()
  for (const p of arr) {
    base[p.modulo] = { ver: p.ver, criar: p.criar, editar: p.editar, deletar: p.deletar }
  }
  return base
}

// Compara duas PermMap — true se forem idênticas
export function permissoesIguais(a: PermMap, b: PermMap): boolean {
  return MODULOS.every((m) => {
    const pa = a[m.key]
    const pb = b[m.key]
    return pa.ver === pb.ver && pa.criar === pb.criar && pa.editar === pb.editar && pa.deletar === pb.deletar
  })
}
