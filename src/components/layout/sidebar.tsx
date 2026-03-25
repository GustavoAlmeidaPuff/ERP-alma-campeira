'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sections } from '@/components/layout/erp-navigation'

const iconGear = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[16px] flex-shrink-0">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

function getInitials(email: string) {
  const name = email.split('@')[0]
  const parts = name.split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const clickedHrefRef = useRef<string | null>(null)
  const clickStartedAtRef = useRef<number | null>(null)
  const clickedLabelRef = useRef<string | null>(null)

  useEffect(() => {
    const clickedHref = clickedHrefRef.current
    if (!clickedHref || pathname !== clickedHref) return

    const startedAt = clickStartedAtRef.current
    const pageName = clickedLabelRef.current ?? clickedHref
    const started = performance.now()
    const timeoutMs = 15000

    const finish = () => {
      clickedHrefRef.current = null
      clickStartedAtRef.current = null
      clickedLabelRef.current = null
    }

    const tick = () => {
      const content = document.querySelector('main')
      const contentReady = Array.from(document.querySelectorAll('[data-nav-content-ready]')).find(
        (el) => el.getAttribute('data-nav-content-ready') === pageName
      )
      const contentReadyVisible = Boolean(contentReady && contentReady.getBoundingClientRect().height > 0)

      if (content && contentReadyVisible) {
        if (process.env.NODE_ENV === 'development' && startedAt) {
          const ms = Math.round(performance.now() - startedAt)
          console.log(`[DEV][NAV] ${pageName} conteúdo visível em ${ms}ms`)
        }
        finish()
        return
      }

      if (performance.now() - started > timeoutMs) {
        finish()
        return
      }

      requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [pathname])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  useEffect(() => {
    const criticalRoutes = ['/vendas', '/clientes', '/usuarios', '/cargos']
    criticalRoutes.forEach((route) => router.prefetch(route))
  }, [router])

  return (
    <aside
      style={{ width: 'var(--ac-sidebar-w)', background: 'var(--ac-sidebar)', borderRight: '1px solid var(--ac-border)' }}
      className="fixed inset-y-0 left-0 flex flex-col z-30"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: '1px solid var(--ac-border)' }}>
        <div className="size-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--ac-accent)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth={2} className="size-4">
            <path d="M14.5 10.5 3 22" /><path d="M14.5 10.5 21 4l-7 7" /><path d="M10.5 14.5 3 22" />
          </svg>
        </div>
        <span className="font-bold text-sm" style={{ color: 'var(--ac-text)' }}>Alma Campeira</span>
      </div>

      {/* Nav com seções */}
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => (
          <div key={section.label} className="mb-1">
            {/* Label da seção */}
            <p
              className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--ac-muted)', opacity: 0.6 }}
            >
              {section.label}
            </p>
            {/* Itens */}
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.available ? item.href : '#'}
                  onClick={() => {
                    if (!item.available || isActive) return
                    clickStartedAtRef.current = performance.now()
                    clickedLabelRef.current = item.label
                    clickedHrefRef.current = item.href
                  }}
                  className={[
                    'flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'font-semibold'
                      : item.available
                      ? 'font-normal'
                      : 'opacity-35 cursor-not-allowed pointer-events-none',
                  ].join(' ')}
                  style={{
                    color: isActive ? 'var(--ac-accent)' : 'var(--ac-muted)',
                    background: isActive
                      ? 'color-mix(in srgb, var(--ac-accent) 10%, transparent)'
                      : 'transparent',
                  }}
                >
                  <span style={{ color: isActive ? 'var(--ac-accent)' : 'var(--ac-muted)' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Rodapé — usuário logado */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--ac-border)' }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--ac-muted) 8%, transparent)' }}>
          {/* Avatar com iniciais */}
          <div
            className="size-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
            style={{ background: 'var(--ac-accent)', color: '#111827' }}
          >
            {userEmail ? getInitials(userEmail) : '…'}
          </div>

          {/* E-mail truncado */}
          <span
            className="flex-1 text-xs truncate"
            style={{ color: 'var(--ac-muted)' }}
            title={userEmail ?? ''}
          >
            {userEmail ?? 'Carregando...'}
          </span>

          {/* Engrenagem → configurações */}
          <Link
            href="/configuracoes"
            onClick={() => {
              if (pathname.startsWith('/configuracoes')) return
              clickStartedAtRef.current = performance.now()
              clickedLabelRef.current = 'Configurações'
              clickedHrefRef.current = '/configuracoes'
            }}
            className="flex-shrink-0 p-1 rounded-md transition-colors hover:opacity-80"
            style={{
              color: pathname.startsWith('/configuracoes') ? 'var(--ac-accent)' : 'var(--ac-muted)',
              background: pathname.startsWith('/configuracoes') ? 'color-mix(in srgb, var(--ac-accent) 12%, transparent)' : 'transparent',
            }}
            title="Configurações"
          >
            {iconGear}
          </Link>
        </div>
      </div>
    </aside>
  )
}
