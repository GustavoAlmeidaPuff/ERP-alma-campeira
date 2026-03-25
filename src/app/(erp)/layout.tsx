import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'

export const dynamic = 'force-dynamic'

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
