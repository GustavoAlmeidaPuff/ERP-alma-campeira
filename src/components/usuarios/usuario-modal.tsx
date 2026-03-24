'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { criarUsuario, atualizarPerfil } from '@/lib/actions/usuarios'
import { PERFIS_USUARIO } from '@/types'
import type { Usuario, PerfilUsuario } from '@/types'

type Props = {
  open: boolean
  onClose: () => void
  editando?: Usuario | null
}

type FormNovo = { email: string; senha: string; nome: string; perfil: PerfilUsuario }
type FormEditar = { nome: string; perfil: PerfilUsuario; ativo: boolean }

export function UsuarioModal({ open, onClose, editando }: Props) {
  const [formNovo, setFormNovo] = useState<FormNovo>({ email: '', senha: '', nome: '', perfil: 'vendas' })
  const [formEditar, setFormEditar] = useState<FormEditar>({ nome: '', perfil: 'vendas', ativo: true })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editando) {
      setFormEditar({ nome: editando.nome, perfil: editando.perfil, ativo: editando.ativo })
    } else {
      setFormNovo({ email: '', senha: '', nome: '', perfil: 'vendas' })
    }
    setErro('')
  }, [editando, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (editando) {
      if (!formEditar.nome.trim()) { setErro('Nome é obrigatório.'); return }
      setLoading(true)
      try {
        await atualizarPerfil(editando.id, formEditar)
        onClose()
      } catch (e: unknown) {
        setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
      } finally {
        setLoading(false)
      }
    } else {
      if (!formNovo.email.trim()) { setErro('E-mail é obrigatório.'); return }
      if (!formNovo.nome.trim()) { setErro('Nome é obrigatório.'); return }
      if (formNovo.senha.length < 6) { setErro('Senha deve ter pelo menos 6 caracteres.'); return }
      setLoading(true)
      try {
        await criarUsuario(formNovo)
        onClose()
      } catch (e: unknown) {
        setErro(e instanceof Error ? e.message : 'Erro ao criar usuário.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editando ? `Editar — ${editando.email}` : 'Novo Usuário'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {editando ? (
          <>
            <Input
              id="nome"
              label="Nome"
              value={formEditar.nome}
              onChange={(e) => setFormEditar((f) => ({ ...f, nome: e.target.value }))}
            />
            <Select
              id="perfil"
              label="Perfil"
              value={formEditar.perfil}
              onChange={(e) => setFormEditar((f) => ({ ...f, perfil: e.target.value as PerfilUsuario }))}
            >
              {PERFIS_USUARIO.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={formEditar.ativo}
                onClick={() => setFormEditar((f) => ({ ...f, ativo: !f.ativo }))}
                className="relative inline-flex h-5 w-9 rounded-full transition-colors flex-shrink-0"
                style={{ background: formEditar.ativo ? 'var(--ac-accent)' : 'var(--ac-border)' }}
              >
                <span
                  className="inline-block size-4 rounded-full bg-white shadow transition-transform mt-0.5"
                  style={{ transform: formEditar.ativo ? 'translateX(18px)' : 'translateX(2px)' }}
                />
              </button>
              <span className="text-sm" style={{ color: 'var(--ac-text)' }}>
                {formEditar.ativo ? 'Usuário ativo' : 'Usuário inativo'}
              </span>
            </div>
          </>
        ) : (
          <>
            <Input
              id="nome"
              label="Nome *"
              placeholder="Ex: João Silva"
              value={formNovo.nome}
              onChange={(e) => setFormNovo((f) => ({ ...f, nome: e.target.value }))}
            />
            <Input
              id="email"
              label="E-mail *"
              type="email"
              placeholder="joao@almacampeira.com.br"
              value={formNovo.email}
              onChange={(e) => setFormNovo((f) => ({ ...f, email: e.target.value }))}
            />
            <Input
              id="senha"
              label="Senha inicial *"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formNovo.senha}
              onChange={(e) => setFormNovo((f) => ({ ...f, senha: e.target.value }))}
            />
            <Select
              id="perfil"
              label="Perfil *"
              value={formNovo.perfil}
              onChange={(e) => setFormNovo((f) => ({ ...f, perfil: e.target.value as PerfilUsuario }))}
            >
              {PERFIS_USUARIO.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </>
        )}

        {erro && (
          <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#dc2626', background: '#fee2e2' }}>
            {erro}
          </p>
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
