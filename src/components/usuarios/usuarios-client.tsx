'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { UsuarioModal } from './usuario-modal'
import { deletarUsuario } from '@/lib/actions/usuarios'
import { PERFIS_USUARIO } from '@/types'
import type { Usuario } from '@/types'

const perfilConfig: Record<string, { label: string; style: React.CSSProperties }> = {
  admin:    { label: 'Administrador', style: { color: '#7c3aed', background: '#ede9fe', border: '1px solid #ddd6fe' } },
  gerente:  { label: 'Gerente',       style: { color: '#b45309', background: '#fef9c3', border: '1px solid #fde047' } },
  producao: { label: 'Produção',      style: { color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd' } },
  vendas:   { label: 'Vendas',        style: { color: '#15803d', background: '#dcfce7', border: '1px solid #bbf7d0' } },
}

function getInitials(nome: string, email: string) {
  const base = nome || email.split('@')[0]
  const parts = base.split(/[\s._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return base.slice(0, 2).toUpperCase()
}

export function UsuariosClient({ usuarios }: { usuarios: Usuario[] }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [deletando, setDeletando] = useState<Usuario | null>(null)
  const [erroDelete, setErroDelete] = useState('')
  const [loadingDelete, setLoadingDelete] = useState(false)

  function abrirNovo() { setEditando(null); setModalAberto(true) }
  function abrirEditar(u: Usuario) { setEditando(u); setModalAberto(true) }

  async function confirmarDelete() {
    if (!deletando) return
    setErroDelete('')
    setLoadingDelete(true)
    try {
      await deletarUsuario(deletando.id)
      setDeletando(null)
    } catch (e: unknown) {
      setErroDelete(e instanceof Error ? e.message : 'Erro ao excluir.')
    } finally {
      setLoadingDelete(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6" style={{ borderBottom: '1px solid var(--ac-border)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ac-text)' }}>Usuários</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ac-muted)' }}>
            {usuarios.length} {usuarios.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo usuário
        </Button>
      </div>

      {/* Info sobre perfis */}
      <div className="px-8 pt-5 pb-2">
        <div className="rounded-xl p-4 flex flex-wrap gap-3" style={{ background: 'var(--ac-card)', border: '1px solid var(--ac-border)' }}>
          <p className="w-full text-xs font-semibold mb-1" style={{ color: 'var(--ac-muted)' }}>PERFIS DE ACESSO</p>
          {PERFIS_USUARIO.map((p) => {
            const cfg = perfilConfig[p.value]
            return (
              <div key={p.value} className="flex items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold" style={cfg.style}>
                  {cfg.label}
                </span>
              </div>
            )
          })}
          <p className="w-full text-xs mt-1" style={{ color: 'var(--ac-muted)' }}>
            Admin tem acesso total · Gerente não gerencia usuários · Produção acessa estoque · Vendas acessa pedidos e clientes
          </p>
        </div>
      </div>

      {/* Tabela */}
      <div className="px-8 py-4">
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--ac-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--ac-bg)', borderBottom: '1px solid var(--ac-border)' }}>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--ac-muted)' }}>Usuário</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--ac-muted)' }}>E-mail</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--ac-muted)' }}>Perfil</th>
                <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--ac-muted)' }}>Status</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--ac-muted)' }}>Criado em</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm" style={{ color: 'var(--ac-muted)' }}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
              {usuarios.map((u, i) => {
                const cfg = perfilConfig[u.perfil] ?? perfilConfig.vendas
                return (
                  <tr
                    key={u.id}
                    style={{ borderTop: i > 0 ? '1px solid var(--ac-border)' : undefined, background: 'var(--ac-card)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ac-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ac-card)')}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'var(--ac-accent)', color: '#111827' }}
                        >
                          {getInitials(u.nome, u.email)}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--ac-text)' }}>
                          {u.nome || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--ac-muted)' }}>{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold" style={cfg.style}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.ativo ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                          style={{ color: '#16a34a', background: '#dcfce7', border: '1px solid #bbf7d0' }}>
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                          style={{ color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--ac-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => abrirEditar(u)} className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--ac-muted)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ac-border)'; e.currentTarget.style.color = 'var(--ac-text)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ac-muted)' }}
                          title="Editar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button onClick={() => { setDeletando(u); setErroDelete('') }} className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--ac-muted)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ac-muted)' }}
                          title="Excluir"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <UsuarioModal open={modalAberto} onClose={() => setModalAberto(false)} editando={editando} />

      <Modal open={!!deletando} onClose={() => setDeletando(null)} title="Excluir usuário">
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: 'var(--ac-text)' }}>
            Tem certeza que deseja excluir <strong>{deletando?.email}</strong>? O usuário perderá acesso imediatamente.
          </p>
          {erroDelete && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#dc2626', background: '#fee2e2' }}>{erroDelete}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeletando(null)}>Cancelar</Button>
            <Button variant="danger" loading={loadingDelete} onClick={confirmarDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
