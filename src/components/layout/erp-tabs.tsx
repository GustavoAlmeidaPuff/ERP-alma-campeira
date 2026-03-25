'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

import { getRouteIcon, getRouteLabel, normalizePath } from '@/components/layout/erp-navigation'
import type { ReactNode } from 'react'

import { getErpTabData, type ErpTabData } from '@/lib/actions/erp-tab-data'

import { MPClient } from '@/components/materias-primas/mp-client'
import { FacasClient } from '@/components/facas/facas-client'
import { FornecedoresClient } from '@/components/fornecedores/fornecedores-client'
import { OcClient } from '@/components/ordens-compra/oc-client'
import { VendasClient } from '@/components/vendas/vendas-client'
import { ClientesClient } from '@/components/clientes/clientes-client'
import { UsuariosClient } from '@/components/usuarios/usuarios-client'
import { CargosClient } from '@/components/cargos/cargos-client'
import { ConfiguracoesClient } from '@/components/configuracoes/configuracoes-client'

type OpenTab = {
  href: string
  label: string
}

const STORAGE_KEY = 'erp_open_tabs_v1'
const ACTIVE_KEY = 'erp_active_tab_v1'

const LOG = process.env.NODE_ENV === 'development'

function normalizeHref(href: string) {
  const [pathOnly] = href.split('?')
  return normalizePath(pathOnly || '/')
}

function parseStoredTabs(value: string | null): OpenTab[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as OpenTab[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => typeof item?.href === 'string' && typeof item?.label === 'string')
      .map((item) => ({ href: normalizeHref(item.href), label: item.label }))
  } catch {
    return []
  }
}

type ErpTabsContextValue = {
  openTabs: OpenTab[]
  activeHref: string
  openTab: (href: string) => void
  selectTab: (href: string) => void
  closeTab: (href: string) => void
  reorderTabs: (fromHref: string, toHref: string) => void
}

const ErpTabsContext = createContext<ErpTabsContextValue | null>(null)

export function useErpTabs() {
  const ctx = useContext(ErpTabsContext)
  if (!ctx) throw new Error('useErpTabs deve ser usado dentro de ErpTabsProvider.')
  return ctx
}

function TabSkeleton({ title }: { title: string }) {
  return (
    <div className="p-8 space-y-5 animate-pulse">
      <div className="h-7 w-44 rounded-lg" style={{ background: 'var(--ac-border)' }} />
      <div className="h-9 w-32 rounded-lg" style={{ background: 'var(--ac-border)' }} />
      <div className="h-9 w-72 rounded-lg" style={{ background: 'var(--ac-border)' }} />
      <div className="text-xs" style={{ color: 'var(--ac-muted)' }}>
        Carregando {title}...
      </div>
    </div>
  )
}

function TabPane({ href, active }: { href: string; active: boolean }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [data, setData] = useState<ErpTabData | null>(null)
  const [errMsg, setErrMsg] = useState<string>('')

  const mountedRef = useRef(false)
  useEffect(() => {
    if (LOG) console.log('[TABS] TabPane mounted', { href, active })
    return () => {
      if (LOG) console.log('[TABS] TabPane unmounted', { href })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        if (LOG) console.log('[TABS] fetch start', { href, active })
        setStatus('loading')
        setData(null)
        setErrMsg('')

        const d = await getErpTabData(href)
        if (cancelled) return
        setData(d)
        setStatus('ready')
        if (LOG) console.log('[TABS] fetch success', { href, kind: d.kind })
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Erro ao carregar.'
        if (cancelled) return
        setErrMsg(msg)
        setStatus('error')
        if (LOG) console.log('[TABS] fetch error', { href, msg })
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [href])

  if (status === 'loading') return <TabSkeleton title={href} />
  if (status === 'error') {
    return (
      <div className="p-8" style={{ color: '#dc2626' }}>
        {errMsg}
      </div>
    )
  }

  if (!data) return null

  // Permite renderizar componente e manter state interno enquanto a aba estiver aberta.
  switch (data.kind) {
    case 'materias-primas':
      return <MPClient materiasPrimas={data.materiasPrimas} fornecedores={data.fornecedores} perm={data.perm} />
    case 'facas':
      return <FacasClient facas={data.facas} categorias={data.categorias} perm={data.perm} />
    case 'fornecedores':
      return <FornecedoresClient fornecedores={data.fornecedores} perm={data.perm} />
    case 'ordens-compra':
      return <OcClient fila={data.fila} ordens={[]} perm={data.perm} />
    case 'vendas':
      return <VendasClient pedidos={data.pedidos} clientes={data.clientes} facas={data.facas} perm={data.perm} />
    case 'clientes':
      return <ClientesClient clientes={data.clientes} perm={data.perm} />
    case 'usuarios':
      return <UsuariosClient usuarios={data.usuarios} cargos={data.cargos} perm={data.perm} />
    case 'cargos':
      return <CargosClient cargos={data.cargos} perm={data.perm} />
    case 'configuracoes':
      return <ConfiguracoesClient categorias={data.categorias} />
    default:
      return null
  }
}

function ErpTabsContent() {
  const { openTabs, activeHref, selectTab, closeTab, reorderTabs } = useErpTabs()
  const pathname = usePathname()

  useEffect(() => {
    if (LOG) console.log('[TABS] active changed', { activeHref, pathname })
  }, [activeHref, pathname])

  const dragHrefRef = useRef<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => setHydrated(true), [])

  return (
    <div>
      {openTabs.length > 0 && (
        <div
          className="sticky top-0 z-20 w-full border-b"
          style={{
            borderColor: 'var(--ac-border)',
            background: 'color-mix(in srgb, var(--ac-bg) 92%, var(--ac-sidebar) 8%)',
          }}
        >
          <div className="flex items-center gap-1 overflow-x-auto px-2 py-2 sm:px-4">
            {openTabs.map((tab) => {
              const isActive = tab.href === activeHref
              const tabIcon = getRouteIcon(tab.href)
              return (
                <div
                  key={tab.href}
                  className="flex min-w-0 flex-shrink-0 items-center gap-2 rounded-md border pl-3 pr-1 py-1.5"
                  draggable
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const fromHref = e.dataTransfer.getData('text/plain') || dragHrefRef.current
                    dragHrefRef.current = null
                    if (fromHref) reorderTabs(fromHref, tab.href)
                  }}
                  onDragStart={(e) => {
                    dragHrefRef.current = tab.href
                    e.dataTransfer.setData('text/plain', tab.href)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  style={{
                    borderColor: isActive ? 'var(--ac-accent)' : 'var(--ac-border)',
                    background: isActive
                      ? 'color-mix(in srgb, var(--ac-accent) 10%, transparent)'
                      : 'color-mix(in srgb, var(--ac-sidebar) 45%, transparent)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => selectTab(tab.href)}
                    className="flex min-w-0 items-center gap-2"
                    style={{ color: isActive ? 'var(--ac-accent)' : 'var(--ac-text)' }}
                    title={tab.label}
                  >
                    {tabIcon ? (
                      <span className="flex-shrink-0" style={{ color: isActive ? 'var(--ac-accent)' : 'var(--ac-muted)' }}>
                        {tabIcon}
                      </span>
                    ) : null}
                    <span className="truncate max-w-[180px] sm:max-w-[220px] text-xs sm:text-sm">{tab.label}</span>
                  </button>

                  <button
                    type="button"
                    aria-label={`Fechar aba ${tab.label}`}
                    onClick={() => closeTab(tab.href)}
                    className="rounded p-1 transition-colors hover:opacity-80"
                    style={{ color: 'var(--ac-muted)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        {openTabs.map((tab) => (
          <div key={tab.href} style={{ display: tab.href === activeHref ? 'block' : 'none' }}>
            {/* Manter montado: não desmontamos o componente, só escondemos. */}
            {hydrated ? <TabPane href={tab.href} active={tab.href === activeHref} /> : null}
          </div>
        ))}
      </div>
    </div>
  )
}

type ErpTabsProviderProps = {
  children: ReactNode
}

export function ErpTabsProvider({ children }: ErpTabsProviderProps) {
  const pathname = usePathname()
  const initialHref = useMemo(() => normalizeHref(pathname), [pathname])
  const initialLabel = useMemo(() => getRouteLabel(initialHref), [initialHref])

  const [openTabs, setOpenTabs] = useState<OpenTab[]>([{ href: initialHref, label: initialLabel }])
  const [activeHref, setActiveHref] = useState<string>(initialHref)

  useEffect(() => {
    try {
      const storedTabs = parseStoredTabs(localStorage.getItem(STORAGE_KEY))
      const storedActive = localStorage.getItem(ACTIVE_KEY)

      if (storedTabs.length > 0) {
        const normalized = storedTabs.map((t) => ({ ...t, href: normalizeHref(t.href), label: t.label }))
        setOpenTabs(normalized)
        const normalizedActive = storedActive ? normalizeHref(storedActive) : normalized[0]?.href
        if (normalizedActive) setActiveHref(normalizedActive)
      }
    } catch {
      // ignore
    }
  }, [])

  const persist = useCallback((tabs: OpenTab[], active: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs))
    localStorage.setItem(ACTIVE_KEY, active)
  }, [])

  const openTab = useCallback(
    (href: string) => {
      const normalizedHref = normalizeHref(href)
      const label = getRouteLabel(normalizedHref)

      setOpenTabs((prev) => {
        const exists = prev.some((t) => t.href === normalizedHref)
        const next = exists ? prev : [...prev, { href: normalizedHref, label }]
        if (LOG) console.log('[TABS] openTab', { href: normalizedHref, nextLen: next.length })
        persist(next, normalizedHref)
        setActiveHref(normalizedHref)
        return next
      })
    },
    [persist]
  )

  const selectTab = useCallback(
    (href: string) => {
      const normalizedHref = normalizeHref(href)
      setActiveHref(normalizedHref)
      if (LOG) console.log('[TABS] selectTab', { href: normalizedHref })
      persist(openTabs, normalizedHref)
      if (!openTabs.some((t) => t.href === normalizedHref)) {
        // Fallback: se abriu via UI externa, garante que a aba exista.
        const label = getRouteLabel(normalizedHref)
        setOpenTabs((prev) => [...prev, { href: normalizedHref, label }])
      }
    },
    [openTabs, persist]
  )

  const closeTab = useCallback(
    (href: string) => {
      const normalizedHref = normalizeHref(href)
      setOpenTabs((prev) => {
        const next = prev.filter((t) => t.href !== normalizedHref)
        const remaining = next
        const nextActive = remaining[remaining.length - 1]?.href ?? ''
        if (LOG) console.log('[TABS] closeTab', { href: normalizedHref, remaining: remaining.length })
        if (nextActive) setActiveHref(nextActive)
        persist(remaining.length ? remaining : prev, nextActive || prev[0]?.href || normalizedHref)
        // Se ficar sem abas, mantemos ao menos uma (o comportamento mais seguro).
        return remaining.length ? remaining : prev
      })
    },
    [persist]
  )

  const reorderTabs = useCallback(
    (fromHref: string, toHref: string) => {
      const fromNorm = normalizeHref(fromHref)
      const toNorm = normalizeHref(toHref)
      if (fromNorm === toNorm) return

      setOpenTabs((prev) => {
        const fromIndex = prev.findIndex((t) => t.href === fromNorm)
        const toIndex = prev.findIndex((t) => t.href === toNorm)
        if (fromIndex < 0 || toIndex < 0) return prev

        const next = [...prev]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, moved)

        if (LOG) console.log('[TABS] reorderTabs', { fromNorm, toNorm })
        persist(next, activeHref)
        return next
      })
    },
    [activeHref, persist]
  )

  const value: ErpTabsContextValue = useMemo(
    () => ({
      openTabs,
      activeHref,
      openTab,
      selectTab,
      closeTab,
      reorderTabs,
    }),
    [openTabs, activeHref, openTab, selectTab, closeTab, reorderTabs]
  )

  return <ErpTabsContext.Provider value={value}>{children}</ErpTabsContext.Provider>
}

export function ErpTabs() {
  return <ErpTabsContent />
}
