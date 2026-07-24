import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Config Supabase manquante : renseigne VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY dans .env.local (voir .env.example).',
  )
}

// Client unique de l'app — seule source de vérité pour les données (AD-1, AD-3).
// Clé publishable : conçue pour vivre côté client ; l'accès réel est protégé par les policies RLS (Epic 2).
// Les defaults navigateur (persistSession, autoRefreshToken, detectSessionInUrl) suffisent.
export const supabase = createClient(supabaseUrl, supabaseKey)
