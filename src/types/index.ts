export type Fornecedor = {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  created_at: string
}

export type MateriaPrima = {
  id: string
  codigo: string
  nome: string
  fornecedor_id: string | null
  foto_url: string | null
  preco_custo: number
  estoque_atual: number
  estoque_minimo: number
  created_at: string
  // join
  fornecedor?: Fornecedor | null
}

export type StatusEstoque = 'ok' | 'atencao' | 'critico'

export function statusEstoque(mp: MateriaPrima): StatusEstoque {
  if (mp.estoque_atual === 0) return 'critico'
  if (mp.estoque_atual <= mp.estoque_minimo) return 'atencao'
  return 'ok'
}

export type Faca = {
  id: string
  codigo: string
  nome: string
  categoria: string
  foto_url: string | null
  preco_venda: number
  estoque_atual: number
  created_at: string
}

export type FacaMateriaPrima = {
  id: string
  faca_id: string
  materia_prima_id: string
  quantidade: number
  materia_prima?: MateriaPrima
}

export const CATEGORIAS_FACA = [
  'Gauchesca',
  'Utilitária',
  'Decorativa',
  'Cozinha',
  'Esportiva',
  'Outro',
] as const

export type CategoriaFaca = (typeof CATEGORIAS_FACA)[number]
