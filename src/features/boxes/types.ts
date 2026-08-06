export interface Box {
  id: string
  user_id: string
  nom: string
  /** Prix payé pour le lot entier (le coût est réparti par unité sur les articles). */
  prix_achat_cents: number | null
  created_at: string
}
