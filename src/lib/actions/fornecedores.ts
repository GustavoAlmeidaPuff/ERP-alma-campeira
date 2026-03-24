'use server'

import { createClient } from '@/lib/supabase/server'
import type { Fornecedor } from '@/types'

export async function getFornecedores(): Promise<Fornecedor[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .order('nome')

  if (error) throw new Error(error.message)
  return data as Fornecedor[]
}
