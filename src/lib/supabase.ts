import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** Vrai si la config Supabase est absente (variables d'env manquantes au build). */
export const supabaseConfigMissing = !supabaseUrl || !supabaseKey

// Client unique de l'app — seule source de vérité pour les données (AD-1, AD-3).
// Clé publishable : conçue pour vivre côté client ; l'accès réel est protégé par les policies RLS (Epic 2).
// Les defaults navigateur (persistSession, autoRefreshToken, detectSessionInUrl) suffisent.
// Si la config manque, on crée un client factice pour éviter un crash au chargement :
// l'app affiche alors un écran d'erreur lisible (voir ConfigErrorScreen) au lieu d'une page blanche.
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseKey ?? 'placeholder-key',
)
