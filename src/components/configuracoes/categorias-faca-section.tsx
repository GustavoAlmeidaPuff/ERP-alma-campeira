'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { criarCategoriaFaca, atualizarCategoriaFaca, deletarCategoriaFaca } from '@/lib/actions/categorias-faca'
import type { CategoriaFacaDB } from '@/types'

type FormCat = {
  nome: string
  cor_texto: string
  cor_fundo: string
  cor_borda: string
}

const formVazio: FormCat = {
  nome: '',
  cor_texto: '#374151',
  cor_fundo: '#f3f4f6',
  cor_borda: '#e5e7eb',
}

function CategoriaBadgePreview({ form }: { form: FormCat }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{
        color: form.cor_texto,
        background: form.cor_fundo,
        border: `1px solid ${form.cor_borda}`,
      }}
    >
      {form.nome || 'Preview'}
    </span>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: 'var(--ac-muted)' }}>{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative size-9 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--ac-border)' }}>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div className="size-full rounded-lg" style={{ background: value }} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
          }}
          className="flex-1 rounded-lg px-3 py-2 text-sm font-mono outline-none transition-all"
          style={{
            background: 'var(--ac-bg)',
            border: '1px solid var(--ac-border)',
            color: 'var(--ac-text)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--ac-accent)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--ac-border)' }}
          maxLength={7}
        />
      </div>
    </div>
  )
}

type Props = {
  categorias: CategoriaFacaDB[]
}

export function CategoriasFacaSection({ categorias }: Props) {
  const router = useRouter()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<CategoriaFacaDB | null>(null)
  const [deletando, setDeletando] = useState<CategoriaFacaDB | null>(null)
  const [form, setForm] = useState<FormCat>(formVazio)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [erroDelete, setErroDelete] = useState('')

  function set(field: keyof FormCat, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function abrirNova() {
    setEditando(null)
    setForm(formVazio)
    setErro('')
    setModalAberto(true)
  }

  function abrirEditar(cat: CategoriaFacaDB) {
    setEditando(cat)
    setForm({ nome: cat.nome, cor_texto: cat.cor_texto, cor_fundo: cat.cor_fundo, cor_borda: cat.cor_borda })
    setErro('')
    setModalAberto(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return }
    if (!/^#[0-9a-fA-F]{6}$/.test(form.cor_texto)) { setErro('Cor do texto inválida.'); return }
    if (!/^#[0-9a-fA-F]{6}$/.test(form.cor_fundo)) { setErro('Cor de fundo inválida.'); return }
    if (!/^#[0-9a-fA-F]{6}$/.test(form.cor_borda)) { setErro('Cor da borda inválida.'); return }

    setLoading(true)
    try {
      if (editando) {
        await atualizarCategoriaFaca(editando.id, form)
      } else {
        await criarCategoriaFaca(form)
      }
      setModalAberto(false)
      router.refresh()
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  async function confirmarDelete() {
    if (!deletando) return
    setErroDelete('')
    setLoadingDelete(true)
    try {
      await deletarCategoriaFaca(deletando.id)
      setDeletando(null)
      router.refresh()
    } catch (e: unknown) {
      setErroDelete(e instanceof Error ? e.message : 'Erro ao excluir.')
    } finally {
      setLoadingDelete(false)
    }
  }

  return (
    <>
      <div
        id="categorias-faca"
        className="rounded-xl p-6"
        style={{ background: 'var(--ac-card)', border: '1px solid var(--ac-border)' }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-semibold text-base" style={{ color: 'var(--ac-text)' }}>
              Categorias de Facas
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--ac-muted)' }}>
              Gerencie as categorias e suas cores de exibição
            </p>
          </div>
          <Button onClick={abrirNova} variant="secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-3.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nova categoria
          </Button>
        </div>

        {categorias.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--ac-muted)' }}>
            Nenhuma categoria cadastrada.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {categorias.map((cat, i) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 px-4 py-3 rounded-lg"
                style={{
                  background: i % 2 === 0 ? 'var(--ac-bg)' : 'transparent',
                  border: '1px solid transparent',
                }}
              >
                {/* Badge preview */}
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold flex-shrink-0"
                  style={{
                    color: cat.cor_texto,
                    background: cat.cor_fundo,
                    border: `1px solid ${cat.cor_borda}`,
                  }}
                >
                  {cat.nome}
                </span>

                {/* Color dots */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <div
                    title={`Texto: ${cat.cor_texto}`}
                    className="size-4 rounded-full flex-shrink-0"
                    style={{ background: cat.cor_texto, border: '2px solid var(--ac-border)' }}
                  />
                  <div
                    title={`Fundo: ${cat.cor_fundo}`}
                    className="size-4 rounded-full flex-shrink-0"
                    style={{ background: cat.cor_fundo, border: '2px solid var(--ac-border)' }}
                  />
                  <div
                    title={`Borda: ${cat.cor_borda}`}
                    className="size-4 rounded-full flex-shrink-0"
                    style={{ background: cat.cor_borda, border: '2px solid var(--ac-border)' }}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => abrirEditar(cat)}
                    className="p-1.5 rounded-lg transition-colors"
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
                  <button
                    onClick={() => { setDeletando(cat); setErroDelete('') }}
                    className="p-1.5 rounded-lg transition-colors"
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal add/edit */}
      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title={editando ? 'Editar categoria' : 'Nova categoria'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--ac-text)' }}>Nome *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              placeholder="Ex: Colecionador"
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
              style={{ background: 'var(--ac-bg)', border: '1px solid var(--ac-border)', color: 'var(--ac-text)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--ac-accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--ac-accent) 20%, transparent)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--ac-border)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-3 gap-3">
            <ColorField label="Cor do texto" value={form.cor_texto} onChange={(v) => set('cor_texto', v)} />
            <ColorField label="Cor de fundo" value={form.cor_fundo} onChange={(v) => set('cor_fundo', v)} />
            <ColorField label="Cor da borda" value={form.cor_borda} onChange={(v) => set('cor_borda', v)} />
          </div>

          {/* Preview */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ background: 'var(--ac-bg)', border: '1px solid var(--ac-border)' }}
          >
            <span className="text-xs font-medium" style={{ color: 'var(--ac-muted)' }}>Preview:</span>
            <CategoriaBadgePreview form={form} />
          </div>

          {erro && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#dc2626', background: '#fee2e2' }}>
              {erro}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit" loading={loading}>
              {editando ? 'Salvar alterações' : 'Criar categoria'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal delete */}
      <Modal open={!!deletando} onClose={() => setDeletando(null)} title="Excluir categoria">
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: 'var(--ac-text)' }}>
            Tem certeza que deseja excluir a categoria <strong>{deletando?.nome}</strong>? As facas que usam essa categoria não serão excluídas, mas perderão o estilo de cor.
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
