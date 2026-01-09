import { createClient } from '@supabase/supabase-js'

// --- CORREÇÃO PARA VITE ---
// No Vite usamos "import.meta.env" e o prefixo "VITE_"
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltam as variáveis de ambiente VITE_...")
}

export const supabase = createClient(supabaseUrl, supabaseKey)
