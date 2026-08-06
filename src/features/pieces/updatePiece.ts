import { supabase } from '../../lib/supabase'
import type { Piece } from './types'

export type PiecePatch = Partial<
  Pick<
    Piece,
    | 'photo_path'
    | 'categorie'
    | 'couleur'
    | 'taille'
    | 'marque'
    | 'prix_achat_cents'
    | 'prix_vente_cents'
    | 'sold_at'
    | 'quantite'
    | 'box_id'
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

/**
 * Marque une pièce comme vendue : fixe le prix de vente et la date de vente.
 * `soldAtISO` permet d'antidater la vente (par défaut : maintenant).
 */
export async function sellPiece(
  id: string,
  prixVenteCents: number,
  soldAtISO: string = new Date().toISOString(),
): Promise<void> {
  const { error } = await supabase
    .from('piece')
    .update({ statut: 'vendue', prix_vente_cents: prixVenteCents, sold_at: soldAtISO })
    .eq('id', id)
  if (error) throw error
}

/** Remet une pièce vendue en stock (réversible) : efface la date de vente. */
export async function restockPiece(id: string): Promise<void> {
  const { error } = await supabase
    .from('piece')
    .update({ statut: 'en_stock', sold_at: null })
    .eq('id', id)
  if (error) throw error
}
