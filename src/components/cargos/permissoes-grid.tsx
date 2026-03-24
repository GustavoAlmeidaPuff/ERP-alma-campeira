'use client'

import { MODULOS } from '@/types'
import type { ModuloKey } from '@/types'

type Perm = { ver: boolean; criar: boolean; editar: boolean; deletar: boolean }
type Permissoes = Record<ModuloKey, Perm>

type Props = {
  value: Permissoes
  onChange: (value: Permissoes) => void
  readonly?: boolean
}

const COLS: { key: keyof Perm; label: string }[] = [
  { key: 'ver',    label: 'Ver' },
  { key: 'criar',  label: 'Criar' },
  { key: 'editar', label: 'Editar' },
  { key: 'deletar', label: 'Excluir' },
]

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onChange}
      className="flex items-center justify-center size-7 rounded-md transition-all mx-auto"
      style={{
        background: checked ? 'color-mix(in srgb, var(--ac-accent) 15%, transparent)' : 'var(--ac-bg)',
        border: `1.5px solid ${checked ? 'var(--ac-accent)' : 'var(--ac-border)'}`,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      title={disabled ? 'Somente leitura' : checked ? 'Permitido — clique para bloquear' : 'Bloqueado — clique para permitir'}
    >
      {checked ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-3.5"
          style={{ color: 'var(--ac-accent)' }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5"
          style={{ color: 'var(--ac-muted)', opacity: 0.4 }}>
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
    </button>
  )
}

export function PermissoesGrid({ value, onChange, readonly = false }: Props) {
  function toggle(modulo: ModuloKey, col: keyof Perm) {
    const perm = value[modulo]
    const newVal = !perm[col]
    // Se habilitar criar/editar/deletar, habilita "ver" também automaticamente
    const ver = col === 'ver' ? newVal : (newVal ? true : perm.ver)
    // Se desabilitar "ver", desabilita tudo
    const others = col === 'ver' && !newVal
      ? { criar: false, editar: false, deletar: false }
      : { criar: perm.criar, editar: perm.editar, deletar: perm.deletar }

    onChange({
      ...value,
      [modulo]: { ...others, ver, [col]: newVal },
    })
  }

  function toggleAll(modulo: ModuloKey) {
    const perm = value[modulo]
    const allOn = COLS.every((c) => perm[c.key])
    const newPerm: Perm = allOn
      ? { ver: false, criar: false, editar: false, deletar: false }
      : { ver: true, criar: true, editar: true, deletar: true }
    onChange({ ...value, [modulo]: newPerm })
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--ac-border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--ac-bg)', borderBottom: '1px solid var(--ac-border)' }}>
            <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--ac-muted)' }}>
              Módulo
            </th>
            {COLS.map((c) => (
              <th key={c.key} className="text-center px-3 py-2.5 font-semibold text-xs uppercase tracking-wide w-20" style={{ color: 'var(--ac-muted)' }}>
                {c.label}
              </th>
            ))}
            {!readonly && (
              <th className="text-center px-3 py-2.5 font-semibold text-xs uppercase tracking-wide w-16" style={{ color: 'var(--ac-muted)' }}>
                Todos
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {MODULOS.map((m, i) => {
            const perm = value[m.key]
            const allOn = COLS.every((c) => perm[c.key])
            return (
              <tr
                key={m.key}
                style={{
                  borderTop: i > 0 ? '1px solid var(--ac-border)' : undefined,
                  background: 'var(--ac-card)',
                }}
              >
                <td className="px-4 py-2.5 font-medium text-sm" style={{ color: 'var(--ac-text)' }}>
                  {m.label}
                </td>
                {COLS.map((c) => (
                  <td key={c.key} className="px-3 py-2.5 text-center">
                    <Toggle
                      checked={perm[c.key]}
                      onChange={() => toggle(m.key, c.key)}
                      disabled={readonly || (c.key !== 'ver' && !perm.ver)}
                    />
                  </td>
                ))}
                {!readonly && (
                  <td className="px-3 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => toggleAll(m.key)}
                      className="text-xs px-2 py-1 rounded transition-colors"
                      style={{
                        color: allOn ? 'var(--ac-accent)' : 'var(--ac-muted)',
                        background: allOn ? 'color-mix(in srgb, var(--ac-accent) 10%, transparent)' : 'var(--ac-bg)',
                        border: `1px solid ${allOn ? 'var(--ac-accent)' : 'var(--ac-border)'}`,
                        fontWeight: 500,
                      }}
                    >
                      {allOn ? 'Remover' : 'Tudo'}
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
