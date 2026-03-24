'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { criarFaca, atualizarFaca } from '@/lib/actions/facas'
import { CATEGORIAS_FACA } from '@/types'
import type { Faca } from '@/types'

type Props = {
  open: boolean
  onClose: () => void
  editando?: Faca | null
}

type Form = {
  nome: string
  categoria: string
  preco_venda: string
  estoque_atual: string
}

const formVazio: Form = { nome: '', categoria: 'Gauchesca', preco_venda: '', estoque_atual: '0' }

export function FacaModal({ open, onClose, editando }: Props) {
  const [form, setForm] = useState<Form>(formVazio)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editando) {
      setForm({
        nome: editando.nome,
        categoria: editando.categoria,
        preco_venda: String(editando.preco_venda),
        estoque_atual: String(editando.estoque_atual),
      })
    } else {
      setForm(formVazio)
    }
    setErro('')
  }, [editando, open])

  function set(field: keyof Form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return }
    if (!form.preco_venda || isNaN(Number(form.preco_venda))) { setErro('Preço de venda inválido.'); return }

    setLoading(true)
    try {
      const payload = {
        nome: form.nome,
        categoria: form.categoria,
        preco_venda: parseFloat(form.preco_venda),
        estoque_atual: parseInt(form.estoque_atual) || 0,
      }

      if (editando) {
        await atualizarFaca(editando.id, payload)
      } else {
        await criarFaca(payload)
      }
      onClose()
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editando ? `Editar — ${editando.codigo}` : 'Nova Faca'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="nome"
          label="Nome *"
          placeholder="Ex: Faca Gauchesca Clássica"
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
        />

        <Select
          id="categoria"
          label="Categoria *"
          value={form.categoria}
          onChange={(e) => set('categoria', e.target.value)}
        >
          {CATEGORIAS_FACA.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="preco_venda"
            label="Preço de Venda (R$) *"
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={form.preco_venda}
            onChange={(e) => set('preco_venda', e.target.value)}
          />
          <Input
            id="estoque_atual"
            label="Estoque Atual"
            type="number"
            min="0"
            value={form.estoque_atual}
            onChange={(e) => set('estoque_atual', e.target.value)}
          />
        </div>

        {erro && (
          <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#dc2626', background: '#fee2e2' }}>
            {erro}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>
            {editando ? 'Salvar alterações' : 'Criar faca'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
