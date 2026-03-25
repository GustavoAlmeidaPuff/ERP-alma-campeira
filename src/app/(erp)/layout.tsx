import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { ErpTabs, ErpTabsProvider } from '@/components/layout/erp-tabs'
import { getAuthenticatedUser } from '@/lib/auth'

export default async function ErpLayout() {
  const user = await getAuthenticatedUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen" style={{ background: 'var(--ac-bg)' }}>
      <ErpTabsProvider>
        <Sidebar />
        <main style={{ marginLeft: 'var(--ac-sidebar-w)' }} className="min-h-screen">
          <ErpTabs />
        </main>
      </ErpTabsProvider>
    </div>
  )
}
