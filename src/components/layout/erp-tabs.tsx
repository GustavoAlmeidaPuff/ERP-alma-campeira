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

function SkeletonHeader({ wide = false }: { wide?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="h-7 w-44 rounded-lg" style={{ background: 'var(--ac-border)' }} />
        <div className="h-3.5 w-52 rounded-lg" style={{ background: 'var(--ac-border)' }} />
      </div>
      <div className={`h-9 rounded-lg ${wide ? 'w-40' : 'w-32'}`} style={{ background: 'var(--ac-border)' }} />
    </div>
  )
}

function SkeletonSearchAndFilters({ withSelect = false }: { withSelect?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="h-9 w-full sm:w-80 rounded-lg" style={{ background: 'var(--ac-border)' }} />
      {withSelect ? <div className="h-9 w-full sm:w-56 rounded-lg" style={{ background: 'var(--ac-border)' }} /> : null}
    </div>
  )
}

function SkeletonTable({ cols = 6, rows = 6 }: { cols?: number; rows?: number }) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--ac-border)', background: 'var(--ac-card)' }}>
      <div className="flex gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--ac-border)', background: 'color-mix(in srgb, var(--ac-border) 30%, transparent)' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 rounded"
            style={{ background: 'var(--ac-border)', width: `${Math.max(52, 120 - i * 8)}px` }}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3 border-b last:border-0" style={{ borderColor: 'var(--ac-border)' }}>
          {Array.from({ length: cols }).map((__, j) => (
            <div
              key={`${i}-${j}`}
              className="h-3.5 rounded"
              style={{ background: 'var(--ac-border)', width: `${Math.max(44, 96 - j * 6 + ((i + j) % 3) * 10)}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function TabSkeleton({ href }: { href: string }) {
  const path = normalizeHref(href)

  if (path === '/ordens-compra') {
    return (
      <div className="p-6 sm:p-8 space-y-5 animate-pulse">
        <SkeletonHeader wide />
        <div className="flex gap-2">
          <div className="h-9 w-36 rounded-lg" style={{ background: 'var(--ac-border)' }} />
          <div className="h-9 w-36 rounded-lg" style={{ background: 'var(--ac-border)' }} />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--ac-border)', background: 'var(--ac-card)' }}>
              <div className="h-5 w-52 rounded" style={{ background: 'var(--ac-border)' }} />
              <div className="h-3.5 w-72 rounded" style={{ background: 'var(--ac-border)' }} />
              <SkeletonTable cols={4} rows={2} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (path === '/vendas') {
    return (
      <div className="p-6 sm:p-8 space-y-5 animate-pulse">
        <SkeletonHeader />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-lg" style={{ background: 'var(--ac-border)' }} />
          ))}
        </div>
        <SkeletonSearchAndFilters />
        <SkeletonTable cols={6} rows={7} />
      </div>
    )
  }

  if (path === '/facas') {
    return (
      <div className="p-6 sm:p-8 space-y-5 animate-pulse">
        <SkeletonHeader />
        <SkeletonSearchAndFilters withSelect />
        <SkeletonTable cols={7} rows={7} />
      </div>
    )
  }

  if (path === '/configuracoes') {
    return (
      <div className="p-6 sm:p-8 space-y-5 animate-pulse">
        <SkeletonHeader />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--ac-border)', background: 'var(--ac-card)' }}>
              <div className="h-5 w-40 rounded" style={{ background: 'var(--ac-border)' }} />
              <div className="h-9 w-full rounded-lg" style={{ background: 'var(--ac-border)' }} />
              <div className="h-9 w-32 rounded-lg" style={{ background: 'var(--ac-border)' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 space-y-5 animate-pulse">
      <SkeletonHeader />
      <SkeletonSearchAndFilters />
      <SkeletonTable cols={6} rows={6} />
      <div className="text-xs" style={{ color: 'var(--ac-muted)' }}>
        Carregando {getRouteLabel(path)}...
      </div>
    </div>
  )
}

function TabPane({ href }: { href: string }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [data, setData] = useState<ErpTabData | null>(null)
  const [errMsg, setErrMsg] = useState<string>('')

  useEffect(() => {
    if (LOG) console.log('[TABS] TabPane mounted', { href })
    return () => {
      if (LOG) console.log('[TABS] TabPane unmounted', { href })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        if (LOG) console.log('[TABS] fetch start', { href })
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

  if (status === 'loading') return <TabSkeleton href={href} />
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
  const draggingRef = useRef(false)

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
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const fromHref = e.dataTransfer.getData('text/plain') || dragHrefRef.current
                    dragHrefRef.current = null
                    draggingRef.current = false
                    if (fromHref) reorderTabs(fromHref, tab.href)
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
                    draggable
                    aria-label={`Arrastar aba ${tab.label}`}
                    title="Arrastar para reordenar"
                    onDragStart={(e) => {
                      draggingRef.current = true
                      dragHrefRef.current = tab.href
                      e.dataTransfer.setData('text/plain', tab.href)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragEnd={() => {
                      draggingRef.current = false
                      dragHrefRef.current = null
                    }}
                    className="flex-shrink-0 rounded p-1 transition-colors cursor-move"
                    style={{ color: 'var(--ac-muted)' }}
                    onClick={(e) => {
                      // Evita clique "acidental" após arrastar
                      if (draggingRef.current) e.preventDefault()
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
                      <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" strokeLinecap="round" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (draggingRef.current) return
                      selectTab(tab.href)
                    }}
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
                    onClick={() => {
                      if (draggingRef.current) return
                      closeTab(tab.href)
                    }}
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
            {/* Mantém montado: só alterna visibilidade. */}
            <TabPane href={tab.href} />
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

  const [openTabs, setOpenTabs] = useState<OpenTab[]>(() => {
    const base = [{ href: initialHref, label: initialLabel }]
    if (typeof window === 'undefined') return base

    const storedTabs = parseStoredTabs(localStorage.getItem(STORAGE_KEY))
    return storedTabs.length ? storedTabs : base
  })

  const [activeHref, setActiveHref] = useState<string>(() => {
    if (typeof window === 'undefined') return initialHref

    const storedTabs = parseStoredTabs(localStorage.getItem(STORAGE_KEY))
    const storedActive = localStorage.getItem(ACTIVE_KEY)
    const normalizedActive = storedActive ? normalizeHref(storedActive) : storedTabs[0]?.href
    return normalizedActive || initialHref
  })

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
