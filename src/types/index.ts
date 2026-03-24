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

// ============================================================
// Módulos do sistema
// ============================================================
export const MODULOS = [
  { key: 'dashboard',       label: 'Dashboard' },
  { key: 'materias_primas', label: 'Matérias-Primas' },
  { key: 'fornecedores',    label: 'Fornecedores' },
  { key: 'facas',           label: 'Facas' },
  { key: 'estoque',         label: 'Estoque / Produção' },
  { key: 'vendas',          label: 'Vendas / Pedidos' },
  { key: 'clientes',        label: 'Clientes' },
  { key: 'ordens_compra',   label: 'Ordens de Compra' },
  { key: 'usuarios',        label: 'Usuários' },
  { key: 'cargos',          label: 'Cargos' },
] as const

export type ModuloKey = (typeof MODULOS)[number]['key']

export type CargoPermissao = {
  id: string
  cargo_id: string
  modulo: ModuloKey
  ver: boolean
  criar: boolean
  editar: boolean
  deletar: boolean
}

export type Cargo = {
  id: string
  nome: string
  descricao: string | null
  cor: string
  criado_em: string
  permissoes: CargoPermissao[]
}

export const CORES_CARGO = [
  { label: 'Roxo',    value: '#7c3aed' },
  { label: 'Âmbar',  value: '#b45309' },
  { label: 'Azul',   value: '#0369a1' },
  { label: 'Verde',  value: '#15803d' },
  { label: 'Rosa',   value: '#be185d' },
  { label: 'Vermelho', value: '#dc2626' },
  { label: 'Cinza',  value: '#374151' },
  { label: 'Amarelo', value: '#ca8a04' },
] as const

// ============================================================
// Usuários
// ============================================================
export type PerfilUsuario = 'admin' | 'gerente' | 'producao' | 'vendas'

export const PERFIS_USUARIO: { value: PerfilUsuario; label: string }[] = [
  { value: 'admin',    label: 'Administrador' },
  { value: 'gerente',  label: 'Gerente' },
  { value: 'producao', label: 'Produção' },
  { value: 'vendas',   label: 'Vendas' },
]

export type UsuarioPerfil = {
  id: string
  nome: string
  perfil: PerfilUsuario
  ativo: boolean
  cargo_id: string | null
}

// Usuário completo (perfil + dados do auth)
export type Usuario = UsuarioPerfil & {
  email: string
  created_at: string
  cargo?: Pick<Cargo, 'id' | 'nome' | 'cor'> | null
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
