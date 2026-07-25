import { supabase } from '../../lib/supabase'
import type { Piece } from './types'

export type PiecePatch = Partial<
  Pick<
    Piece,
    'photo_path' | 'categorie' | 'couleur' | 'taille' | 'marque' | 'prix_achat_cents' | 'prix_vente_cents'
  >
>

/** Met à jour les champs d'une pièce (RLS filtre par utilisateur). */
export async function updatePiece(id: string, patch: PiecePatch): Promise<void> {
  const { error } = await supabase.from('piece').update(patch).eq('id', id)
  if (error) throw error
}

/** Supprime une pièce (RLS filtre par utilisateur). */
export async function deletePiece(id: string): Promise<void> {
  const { error } = await supabase.from('piece').delete().eq('id', id)
  if (error) throw error
}
