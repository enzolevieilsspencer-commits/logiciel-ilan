import { supabase } from '../../lib/supabase'
import { uploadPhoto } from './storage'

export interface NewPieceInput {
  photo: File | null
  categorie: string | null
  couleur: string | null
  taille: string
  marque: string
  prixAchatCents: number | null
}

export interface AddPieceResult {
  ok: boolean
  photoSkipped: boolean // true si la photo a échoué mais la pièce est créée
}

/**
 * Crée une pièce (statut en_stock). La photo est optionnelle et robuste :
 * si l'upload échoue, la pièce est créée quand même sans photo (AC #6).
 * `user_id` est laissé au default auth.uid() côté DB (ne pas l'envoyer).
 */
export async function createPiece(input: NewPieceInput): Promise<AddPieceResult> {
  let photoPath: string | null = null
  let photoSkipped = false

  if (input.photo) {
    try {
      photoPath = await uploadPhoto(input.photo)
    } catch {
      photoSkipped = true
    }
  }

  const { error } = await supabase.from('piece').insert({
    photo_path: photoPath,
    categorie: input.categorie,
    couleur: input.couleur,
    taille: input.taille || null,
    marque: input.marque || null,
    prix_achat_cents: input.prixAchatCents,
    statut: 'en_stock',
  })
  if (error) throw error

  return { ok: true, photoSkipped }
}
