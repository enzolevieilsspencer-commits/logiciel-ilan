import { supabase } from '../../lib/supabase'

export interface BoxInput {
  nom: string
  prixAchatCents: number | null
}

/** Crée une box (lot). `user_id` est laissé au default auth.uid() côté DB. */
export async function createBox(input: BoxInput): Promise<string> {
  const { data, error } = await supabase
    .from('box')
    .insert({ nom: input.nom, prix_achat_cents: input.prixAchatCents })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

/** Met à jour une box (nom / prix du lot). */
export async function updateBox(id: string, input: BoxInput): Promise<void> {
  const { error } = await supabase
    .from('box')
    .update({ nom: input.nom, prix_achat_cents: input.prixAchatCents })
    .eq('id', id)
  if (error) throw error
}

/** Supprime une box. Les articles rattachés voient leur `box_id` remis à null (FK on delete set null). */
export async function deleteBox(id: string): Promise<void> {
  const { error } = await supabase.from('box').delete().eq('id', id)
  if (error) throw error
}

/** Rattache (ou détache si boxId=null) plusieurs articles à une box en une fois. */
export async function assignPiecesToBox(pieceIds: string[], boxId: string | null): Promise<void> {
  if (pieceIds.length === 0) return
  const { error } = await supabase.from('piece').update({ box_id: boxId }).in('id', pieceIds)
  if (error) throw error
}
