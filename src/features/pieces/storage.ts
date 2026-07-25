import imageCompression from 'browser-image-compression'
import { supabase } from '../../lib/supabase'

const BUCKET = 'piece-photos'

/**
 * Compresse la photo (~1600px, webp) puis l'upload dans le bucket privé,
 * au chemin `${user.id}/${uuid}.webp` (le 1er dossier DOIT être l'id user, RLS).
 * Retourne le `photo_path` à stocker sur la pièce.
 */
export async function uploadPhoto(file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('non authentifié')

  const compressed = await imageCompression(file, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/webp',
  })

  const path = `${user.id}/${crypto.randomUUID()}.webp`
  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: 'image/webp',
    upsert: false,
  })
  if (error) throw error
  return path
}

/** Supprime une photo du bucket (best-effort : n'échoue jamais le flux appelant). */
export async function deletePhoto(path: string): Promise<void> {
  try {
    await supabase.storage.from(BUCKET).remove([path])
  } catch {
    // ignoré volontairement : la suppression de la photo ne doit pas bloquer.
  }
}
