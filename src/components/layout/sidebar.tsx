'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/materias-primas',
    label: 'Matérias-Primas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: '/fornecedores',
    label: 'Fornecedores',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/facas',
    label: 'Facas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
        <path d="M14.5 10.5 3 22" />
        <path d="M14.5 10.5 21 4l-7 7" />
        <path d="M10.5 14.5 3 22" />
      </svg>
    ),
  },
  {
    href: '/estoque',
    label: 'Estoque',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    href: '/vendas',
    label: 'Vendas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    href: '/clientes',
    label: 'Clientes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/ordens-compra',
    label: 'Ordens de Compra',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: '/usuarios',
    label: 'Usuários',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 1 0-16 0" />
      </svg>
    ),
  },
]

const bottomItems = [
  {
    href: '/configuracoes',
    label: 'Configurações',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

const activeRoutes = ['/materias-primas', '/facas', '/configuracoes']

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{ width: 'var(--ac-sidebar-w)', background: 'var(--ac-sidebar)', borderRight: '1px solid var(--ac-border)' }}
      className="fixed inset-y-0 left-0 flex flex-col z-30"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: '1px solid var(--ac-border)' }}>
        <div
          className="size-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--ac-accent)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth={2} className="size-4">
            <path d="M14.5 10.5 3 22" />
            <path d="M14.5 10.5 21 4l-7 7" />
            <path d="M10.5 14.5 3 22" />
          </svg>
        </div>
        <span className="font-bold text-sm" style={{ color: 'var(--ac-text)' }}>
          Alma Campeira
        </span>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const isAvailable = activeRoutes.includes(item.href)

          return (
            <Link
              key={item.href}
              href={isAvailable ? item.href : '#'}
              className={[
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors',
                isActive ? 'font-semibold' : isAvailable ? 'font-normal' : 'opacity-40 cursor-not-allowed pointer-events-none',
              ].join(' ')}
              style={{
                color: isActive ? 'var(--ac-accent)' : 'var(--ac-muted)',
                background: isActive ? 'color-mix(in srgb, var(--ac-accent) 10%, transparent)' : 'transparent',
              }}
            >
              <span style={{ color: isActive ? 'var(--ac-accent)' : 'var(--ac-muted)' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Rodapé — Configurações */}
      <div className="py-3" style={{ borderTop: '1px solid var(--ac-border)' }}>
        {bottomItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors font-normal"
              style={{
                color: isActive ? 'var(--ac-accent)' : 'var(--ac-muted)',
                background: isActive ? 'color-mix(in srgb, var(--ac-accent) 10%, transparent)' : 'transparent',
              }}
            >
              <span style={{ color: isActive ? 'var(--ac-accent)' : 'var(--ac-muted)' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
