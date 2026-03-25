'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { getRouteIcon, getRouteLabel, normalizePath } from '@/components/layout/erp-navigation'

type OpenTab = {
  href: string
  label: string
}

const STORAGE_KEY = 'erp_open_tabs_v1'
const RECENTS_KEY = 'erp_open_tabs_recents_v1'

type ErpTabsProps = {
  children: ReactNode
}

function serializePath(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname
}

function normalizeHref(href: string) {
  const [pathOnly, query = ''] = href.split('?')
  const normalizedPath = normalizePath(pathOnly || '/')
  return query ? `${normalizedPath}?${query}` : normalizedPath
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

export function ErpTabs({ children }: ErpTabsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tabs, setTabs] = useState<OpenTab[]>([])
  const [hydrated, setHydrated] = useState(false)
  const dragHrefRef = useRef<string | null>(null)
  const ignoreClickRef = useRef(false)
  const dragStartedRef = useRef(false)
  const holdTimeoutRef = useRef<number | null>(null)
  const [recentHrefs, setRecentHrefs] = useState<string[]>([])
  const contentCacheRef = useRef<Map<string, ReactNode>>(new Map())
  const latestChildrenRef = useRef<ReactNode>(null)

  const currentHref = useMemo(() => {
    const query = searchParams?.toString() ?? ''
    return normalizeHref(serializePath(pathname, query))
  }, [pathname, searchParams])

  const currentLabel = useMemo(() => getRouteLabel(pathname), [pathname])

  useEffect(() => {
    const stored = parseStoredTabs(localStorage.getItem(STORAGE_KEY))
    setTabs(stored)

    const recentsRaw = localStorage.getItem(RECENTS_KEY)
    if (recentsRaw) {
      try {
        const parsed = JSON.parse(recentsRaw)
        if (Array.isArray(parsed)) {
          setRecentHrefs(parsed.filter((x) => typeof x === 'string').map((x) => normalizeHref(x)))
        }
      } catch {
        // ignore
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) window.clearTimeout(holdTimeoutRef.current)
      holdTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return

    // Atualiza recência para pré-carregar retorno instantâneo.
    setRecentHrefs((prev) => {
      const next = prev.filter((h) => h !== currentHref)
      next.push(currentHref)
      const trimmed = next.slice(-6)
      localStorage.setItem(RECENTS_KEY, JSON.stringify(trimmed))
      return trimmed
    })

    setTabs((prevTabs) => {
      const existingIndex = prevTabs.findIndex((tab) => tab.href === currentHref)
      if (existingIndex >= 0) {
        // A aba já existe: não muda a ordem ao ativar (só atualiza o label se tiver mudado).
        const existing = prevTabs[existingIndex]
        if (existing.label === currentLabel) return prevTabs
        const nextTabs = [...prevTabs]
        nextTabs[existingIndex] = { ...existing, label: currentLabel }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTabs))
        return nextTabs
      }

      // Aba nova: adiciona no final (por padrão). A ordem depois só muda via drag-and-drop.
      const nextTabs = [...prevTabs, { href: currentHref, label: currentLabel }]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTabs))
      return nextTabs
    })
  }, [currentHref, currentLabel])

  useEffect(() => {
    // Prefetch das últimas abas ativadas (mantém o retorno instantâneo).
    // Limite já é feito pelo slice em recentHrefs.
    recentHrefs.forEach((href) => router.prefetch(href))
  }, [router, recentHrefs])

  useEffect(() => {
    // Garante que a aba atual sempre esteja pré-carregada.
    router.prefetch(currentHref)
  }, [router, currentHref])

  const closeTab = (tabHref: string) => {
    const normalizedHref = normalizeHref(tabHref)
    if (tabs.length === 1 && normalizedHref === currentHref) return

    contentCacheRef.current.delete(normalizedHref)

    let nextTabsAfterClose: OpenTab[] = []
    setTabs((prevTabs) => {
      const nextTabs = prevTabs.filter((tab) => tab.href !== normalizedHref)
      nextTabsAfterClose = nextTabs
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTabs))
      return nextTabs
    })

    if (normalizedHref !== currentHref) return

    const fallbackTab = nextTabsAfterClose[nextTabsAfterClose.length - 1]
    if (fallbackTab) {
      router.push(fallbackTab.href)
      return
    }
  }

  // Keep-alive: só armazenamos `children` quando o conteúdo da página indica que terminou
  // (sem gravar o fallback/skeleton na cache).
  useEffect(() => {
    latestChildrenRef.current = children
  }, [children])

  useEffect(() => {
    let cancelled = false
    const label = currentLabel
    const href = currentHref
    const startedAt = performance.now()
    const timeoutMs = 15000

    const tick = () => {
      if (cancelled) return
      const el = document.querySelector(`[data-nav-content-ready="${label}"]`) as HTMLElement | null
      const height = el ? el.getBoundingClientRect().height : 0
      if (height > 0 && latestChildrenRef.current) {
        contentCacheRef.current.set(href, latestChildrenRef.current)
        return
      }

      if (performance.now() - startedAt > timeoutMs) return
      requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)

    return () => {
      cancelled = true
    }
  }, [currentHref, currentLabel])

  const reorderTabs = (fromHref: string, toHref: string) => {
    const fromNorm = normalizeHref(fromHref)
    const toNorm = normalizeHref(toHref)
    if (fromNorm === toNorm) return
    setTabs((prevTabs) => {
      const fromIndex = prevTabs.findIndex((t) => t.href === fromNorm)
      const toIndex = prevTabs.findIndex((t) => t.href === toNorm)
      if (fromIndex < 0 || toIndex < 0) return prevTabs

      const nextTabs = [...prevTabs]
      const [moved] = nextTabs.splice(fromIndex, 1)
      nextTabs.splice(toIndex, 0, moved)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTabs))
      return nextTabs
    })
  }

  return (
    <div>
      {tabs.length > 0 && (
        <div
          className="sticky top-0 z-20 w-full border-b"
          style={{
            borderColor: 'var(--ac-border)',
            background: 'color-mix(in srgb, var(--ac-bg) 92%, var(--ac-sidebar) 8%)',
          }}
        >
          <div className="flex items-center gap-1 overflow-x-auto px-2 py-2 sm:px-4">
            {tabs.map((tab) => {
              const isActive = tab.href === currentHref
              const tabIcon = getRouteIcon(tab.href)
              return (
                <div
                  key={tab.href}
                  className="flex min-w-0 flex-shrink-0 items-center gap-2 rounded-md border pl-3 pr-1 py-1.5"
                  draggable
                  onDragOver={(e) => {
                    // Necessário para o drop ser aceito.
                    e.preventDefault()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const fromHref = e.dataTransfer.getData('text/plain') || dragHrefRef.current
                    dragHrefRef.current = null
                    if (fromHref) reorderTabs(fromHref, tab.href)
                  }}
                  onDragStart={(e) => {
                    dragStartedRef.current = true
                    ignoreClickRef.current = true
                    dragHrefRef.current = tab.href
                    e.dataTransfer.setData('text/plain', tab.href)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnd={() => {
                    // Mantém `ignoreClickRef` até o próximo pointerdown para impedir navegação
                    // do clique "fantasma" que pode ocorrer após drop.
                    dragStartedRef.current = false
                    window.setTimeout(() => {
                      ignoreClickRef.current = false
                    }, 200)
                  }}
                  onPointerDown={(e) => {
                    if (e.button !== 0) return
                    ignoreClickRef.current = false
                    if (holdTimeoutRef.current) window.clearTimeout(holdTimeoutRef.current)
                    // Se o usuário "segurar", tratamos como intenção de drag and drop.
                    // Assim, ao soltar, não navegamos acidentalmente.
                    holdTimeoutRef.current = window.setTimeout(() => {
                      ignoreClickRef.current = true
                    }, 250)
                  }}
                  onPointerUp={() => {
                    if (holdTimeoutRef.current) window.clearTimeout(holdTimeoutRef.current)
                    holdTimeoutRef.current = null
                  }}
                  onClickCapture={(e) => {
                    if (ignoreClickRef.current || dragStartedRef.current) {
                      e.preventDefault()
                      e.stopPropagation()
                      window.setTimeout(() => {
                        ignoreClickRef.current = false
                      }, 0)
                    }
                  }}
                  style={{
                    borderColor: isActive ? 'var(--ac-accent)' : 'var(--ac-border)',
                    background: isActive
                      ? 'color-mix(in srgb, var(--ac-accent) 10%, transparent)'
                      : 'color-mix(in srgb, var(--ac-sidebar) 45%, transparent)',
                  }}
                >
                  <Link
                    href={tab.href}
                    className="max-w-[180px] truncate text-xs sm:max-w-[220px] sm:text-sm"
                    style={{ color: isActive ? 'var(--ac-accent)' : 'var(--ac-text)' }}
                    title={tab.label}
                  >
                    <span className="sr-only">{tab.label}</span>
                    <span className="inline-flex items-center gap-2">
                      {tabIcon ? (
                        <span
                          className="flex-shrink-0"
                          style={{
                            color: isActive ? 'var(--ac-accent)' : 'var(--ac-muted)',
                          }}
                        >
                          {tabIcon}
                        </span>
                      ) : null}
                      <span className="truncate">{tab.label}</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    aria-label={`Fechar aba ${tab.label}`}
                    onClick={() => closeTab(tab.href)}
                    onPointerDown={(e) => {
                      // Não deixar o close iniciar o "hold-to-drag".
                      e.stopPropagation()
                      ignoreClickRef.current = false
                      dragStartedRef.current = false
                      if (holdTimeoutRef.current) window.clearTimeout(holdTimeoutRef.current)
                      holdTimeoutRef.current = null
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

      {/* Conteúdo das abas: só alterna visibilidade, não desmonta */}
      <div>
        {(tabs.length > 0 ? tabs : [{ href: currentHref, label: currentLabel }]).map((tab) => {
          const active = tab.href === currentHref
          const cached = contentCacheRef.current.get(tab.href)
          const node = cached ?? (active ? children : null)
          return (
            <div key={tab.href} style={{ display: active ? 'block' : 'none' }}>
              {node}
            </div>
          )
        })}
      </div>
    </div>
  )
}
