'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { criarUsuario, atualizarPerfil } from '@/lib/actions/usuarios'
import type { Usuario, Cargo } from '@/types'

type Props = {
  open: boolean
  onClose: () => void
  editando?: Usuario | null
  cargos: Pick<Cargo, 'id' | 'nome' | 'cor'>[]
}

export function UsuarioModal({ open, onClose, editando, cargos }: Props) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cargoId, setCargoId] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editando) {
      setNome(editando.nome)
      setCargoId(editando.cargo_id ?? '')
      setAtivo(editando.ativo)
    } else {
      setNome('')
      setEmail('')
      setSenha('')
      setCargoId(cargos[0]?.id ?? '')
      setAtivo(true)
    }
    setErro('')
  }, [editando, open, cargos])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!nome.trim()) { setErro('Nome é obrigatório.'); return }

    if (!editando) {
      if (!email.trim()) { setErro('E-mail é obrigatório.'); return }
      if (senha.length < 6) { setErro('Senha deve ter pelo menos 6 caracteres.'); return }
    }

    setLoading(true)
    try {
      if (editando) {
        await atualizarPerfil(editando.id, { nome, ativo, cargo_id: cargoId || null })
      } else {
        await criarUsuario({ email, senha, nome, cargo_id: cargoId || null })
      }
      onClose()
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editando ? `Editar — ${editando.email}` : 'Novo Usuário'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input id="nome" label="Nome *" placeholder="Ex: João Silva"
          value={nome} onChange={(e) => setNome(e.target.value)} />

        {!editando && (
          <>
            <Input id="email" label="E-mail *" type="email" placeholder="joao@almacampeira.com.br"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="senha" label="Senha inicial *" type="password" placeholder="Mínimo 6 caracteres"
              value={senha} onChange={(e) => setSenha(e.target.value)} />
          </>
        )}

        {/* Cargo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--ac-text)' }}>Cargo</label>
          {cargos.length === 0 ? (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#b45309', background: '#fef9c3', border: '1px solid #fde047' }}>
              Nenhum cargo cadastrado. Crie cargos em <strong>Sistema → Cargos</strong> antes de atribuir.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              <select
                value={cargoId}
                onChange={(e) => setCargoId(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all appearance-none"
                style={{
                  background: 'var(--ac-card)', border: '1px solid var(--ac-border)', color: 'var(--ac-text)',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%236b7280' stroke-width='2' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px', paddingRight: '36px',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--ac-accent)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--ac-border)' }}
              >
                <option value="">— Sem cargo —</option>
                {cargos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              {/* Pill de preview do cargo selecionado */}
              {cargoId && (() => {
                const c = cargos.find((x) => x.id === cargoId)
                if (!c) return null
                return (
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full flex-shrink-0" style={{ background: c.cor }} />
                    <span className="text-xs" style={{ color: 'var(--ac-muted)' }}>
                      Cargo selecionado: <strong style={{ color: 'var(--ac-text)' }}>{c.nome}</strong>
                    </span>
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        {editando && (
          <div className="flex items-center gap-3">
            <button type="button" role="switch" aria-checked={ativo}
              onClick={() => setAtivo((v) => !v)}
              className="relative inline-flex h-5 w-9 rounded-full transition-colors flex-shrink-0"
              style={{ background: ativo ? 'var(--ac-accent)' : 'var(--ac-border)' }}
            >
              <span className="inline-block size-4 rounded-full bg-white shadow transition-transform mt-0.5"
                style={{ transform: ativo ? 'translateX(18px)' : 'translateX(2px)' }} />
            </button>
            <span className="text-sm" style={{ color: 'var(--ac-text)' }}>
              {ativo ? 'Usuário ativo' : 'Usuário inativo'}
            </span>
          </div>
        )}

        {erro && (
          <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#dc2626', background: '#fee2e2' }}>{erro}</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>
            {editando ? 'Salvar alterações' : 'Criar usuário'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
