import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/env";

import { AsyncLocalStorage } from 'async_hooks'

type CookieAll = Array<{
  name: string
  value: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any
}>

const cookieAllStorage = new AsyncLocalStorage<CookieAll>()

export async function withSupabaseCookieContext<T>(fn: () => Promise<T>): Promise<T> {
  const cookieStore = await cookies()
  const cookieAll = cookieStore.getAll()
  return cookieAllStorage.run(cookieAll, fn)
}

export async function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
  const cookieAllFromContext = cookieAllStorage.getStore()

  // Quando estamos dentro de unstable_cache, cookies() não pode ser chamado.
  // Por isso, quando existe contexto, usamos apenas os cookies já capturados.
  if (cookieAllFromContext) {
    return createServerClient(supabaseUrl, supabasePublishableKey, {
      cookies: {
        getAll() {
          return cookieAllFromContext
        },
        setAll() {
          // Em cache não precisamos (nem devemos) tentar setar cookies.
        },
      },
    })
  }

  // Fallback normal (fora de unstable_cache): usamos o cookieStore real.
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Components não podem setar cookies — ignorar silenciosamente.
          // A sessão é renovada pelo middleware.
        }
      },
    },
  })
}
