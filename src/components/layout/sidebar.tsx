'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type NavItem = {
  href: string
  label: string
  available: boolean
  icon: React.ReactNode
}

type NavSection = {
  label: string
  items: NavItem[]
}

const iconMP = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-[18px]"
  >
    <path d="M4 20v-2" />
    <path d="M3 18h3" />
    <path d="M5 18 18.4 4.6a1.7 1.7 0 0 1 2.4 2.4L7.4 20.4a2 2 0 0 1-1.4.6H4.6a.6.6 0 0 1-.6-.6V19a2 2 0 0 1 .6-1.4Z" />
  </svg>
)
const iconFaca = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-[18px]">
    <path d="M4 22 L4 19" />
    <path d="M2 19 L6 19" />
    <path d="M4 19 L20 5 C21 4 22 5 21 6 C20 8 8 18 6 19" />
  </svg>
)
const iconFornecedor = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)
const iconOC = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)
const iconVendas = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)
const iconClientes = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const iconUsuarios = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
    <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
  </svg>
)

const sections: NavSection[] = [
  {
    label: 'Estoque',
    items: [
      { href: '/materias-primas', label: 'Matérias-Primas', available: true, icon: iconMP },
      { href: '/facas', label: 'Facas', available: true, icon: iconFaca },
    ],
  },
  {
    label: 'Compras',
    items: [
      { href: '/fornecedores', label: 'Fornecedores', available: true, icon: iconFornecedor },
      { href: '/ordens-compra', label: 'Ordens de Compra', available: true, icon: iconOC },
    ],
  },
  {
    label: 'Vendas',
    items: [
      { href: '/vendas', label: 'Vendas', available: true, icon: iconVendas },
      { href: '/clientes', label: 'Clientes', available: true, icon: iconClientes },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/usuarios', label: 'Usuários', available: true, icon: iconUsuarios },
      {
        href: '/cargos',
        label: 'Cargos',
        available: true,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
            <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        ),
      },
    ],
  },
]

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
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  return (
    <aside
      style={{ width: 'var(--ac-sidebar-w)', background: 'var(--ac-sidebar)', borderRight: '1px solid var(--ac-border)' }}
      className="fixed inset-y-0 left-0 flex flex-col z-30"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: '1px solid var(--ac-border)' }}>
        <div className="size-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--ac-accent)' }}>
          <span
            className="block size-5"
            style={{
              backgroundColor: '#FACC15',
              WebkitMaskImage: "url('/images/logo.png')",
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              WebkitMaskSize: 'contain',
              maskImage: "url('/images/logo.png')",
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              maskSize: 'contain',
            }}
          />
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
              const isPending = pendingHref === item.href
              return (
                <Link
                  key={item.href}
                  href={item.available ? item.href : '#'}
                  onClick={() => {
                    if (!item.available || isActive) return
                    setPendingHref(item.href)
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
                    color: isActive ? 'var(--ac-accent)' : isPending ? 'var(--ac-accent)' : 'var(--ac-muted)',
                    background: isActive
                      ? 'color-mix(in srgb, var(--ac-accent) 10%, transparent)'
                      : isPending
                      ? 'color-mix(in srgb, var(--ac-accent) 6%, transparent)'
                      : 'transparent',
                  }}
                >
                  <span style={{ color: isActive || isPending ? 'var(--ac-accent)' : 'var(--ac-muted)' }}>
                    {isPending ? (
                      <svg viewBox="0 0 24 24" className="size-[18px] animate-spin" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                      </svg>
                    ) : item.icon}
                  </span>
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
              setPendingHref('/configuracoes')
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
