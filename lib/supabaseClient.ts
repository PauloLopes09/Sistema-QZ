import { createClient } from '@supabase/supabase-js'

// Estas linhas dizem: "Vercel, por favor, entrega as chaves secretas"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Se a Vercel não entregar as chaves, mostramos um erro
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltam as variáveis de ambiente do Supabase.")
}

// Criamos a conexão
export const supabase = createClient(supabaseUrl, supabaseKey)
