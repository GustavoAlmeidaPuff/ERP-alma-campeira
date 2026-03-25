import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { getAuthenticatedUser } from '@/lib/auth'

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen" style={{ background: 'var(--ac-bg)' }}>
      <Sidebar />
      <main
        style={{ marginLeft: 'var(--ac-sidebar-w)' }}
        className="min-h-screen"
      >
        {children}
      </main>
    </div>
  )
}
