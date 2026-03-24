import { createClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { redirect } from 'next/navigation'

export default async function Home() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8" style={{ background: 'var(--ac-bg)' }}>
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--ac-text)' }}>ERP Alma Campeira</h1>
          <p className="text-sm" style={{ color: 'var(--ac-muted)' }}>
            Copie <code>.env.example</code> para <code>.env.local</code> e preencha as variáveis do Supabase.
          </p>
        </div>
      </main>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  redirect('/materias-primas')
}
