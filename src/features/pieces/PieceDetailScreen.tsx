import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { Chips } from '../../components/ui/Chips'
import { CATEGORIES, COULEURS, centsToEuros, eurosToCents, type Piece } from './types'
import { uploadPhoto, deletePhoto } from './storage'
import { updatePiece, deletePiece, type PiecePatch } from './updatePiece'

interface PieceDetailScreenProps {
  piece: Piece
  onBack: () => void
  onChanged: () => void
  onDeleted: () => void
}

export function PieceDetailScreen({ piece, onBack, onChanged, onDeleted }: PieceDetailScreenProps) {
  const [categorie, setCategorie] = useState(piece.categorie)
  const [couleur, setCouleur] = useState(piece.couleur)
  const [taille, setTaille] = useState(piece.taille ?? '')
  const [marque, setMarque] = useState(piece.marque ?? '')
  const [prixAchat, setPrixAchat] = useState(centsToEuros(piece.prix_achat_cents))
  const [prixVente, setPrixVente] = useState(centsToEuros(piece.prix_vente_cents))
  const [newPhoto, setNewPhoto] = useState<File | null>(null)

  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL signée de la photo existante.
  useEffect(() => {
    if (!piece.photo_path) return
    let active = true
    supabase.storage
      .from('piece-photos')
      .createSignedUrl(piece.photo_path, 3600)
      .then(({ data }) => {
        if (active) setSignedUrl(data?.signedUrl ?? null)
      })
    return () => {
      active = false
    }
  }, [piece.photo_path])

  // Aperçu local de la nouvelle photo choisie.
  useEffect(() => {
    if (!newPhoto) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(newPhoto)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [newPhoto])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const prixAchatCents = eurosToCents(prixAchat)
    const prixVenteCents = eurosToCents(prixVente)
    if ((prixAchat.trim() !== '' && prixAchatCents === null) || (prixVente.trim() !== '' && prixVenteCents === null)) {
      setError('Prix invalide.')
      return
    }

    setSaving(true)
    const patch: PiecePatch = {
      categorie,
      couleur,
      taille: taille || null,
      marque: marque || null,
      prix_achat_cents: prixAchatCents,
      prix_vente_cents: prixVenteCents,
    }

    const oldPath = piece.photo_path
    if (newPhoto) {
      try {
        patch.photo_path = await uploadPhoto(newPhoto)
      } catch {
        alert('La nouvelle photo n’a pas pu être enregistrée ; les autres modifications sont conservées.')
      }
    }

    try {
      await updatePiece(piece.id, patch)
      if (patch.photo_path && oldPath && oldPath !== patch.photo_path) {
        await deletePhoto(oldPath)
      }
      onChanged()
    } catch {
      setError('Impossible d’enregistrer. Réessaie.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    setError(null)
    setDeleting(true)
    try {
      await deletePiece(piece.id)
      if (piece.photo_path) await deletePhoto(piece.photo_path)
      onDeleted()
    } catch {
      setError('Impossible de supprimer. Réessaie.')
      setDeleting(false)
    }
  }

  const inputClass =
    'rounded-[var(--radius-md)] bg-app px-4 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-teal'
  const photoSrc = previewUrl ?? signedUrl

  return (
    <main className="min-h-screen bg-app text-ink p-5">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onBack} className="text-sm font-semibold text-muted">
            ← Retour
          </button>
          <h1 className="text-lg font-bold text-teal-dark">Fiche pièce</h1>
          <span className="w-14" />
        </div>

        <div className="flex h-48 items-center justify-center overflow-hidden rounded-[var(--radius-card)] bg-white">
          {photoSrc ? (
            <img src={photoSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-5xl">👕</span>
          )}
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm font-semibold text-muted">
            Remplacer la photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setNewPhoto(e.target.files?.[0] ?? null)}
              className="text-sm text-ink"
            />
          </label>

          <div className="flex flex-col gap-2 text-sm font-semibold text-muted">
            Catégorie
            <Chips options={CATEGORIES} value={categorie} onChange={setCategorie} />
          </div>

          <div className="flex flex-col gap-2 text-sm font-semibold text-muted">
            Couleur
            <Chips options={COULEURS} value={couleur} onChange={setCouleur} />
          </div>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm font-semibold text-muted">
              Taille
              <input value={taille} onChange={(e) => setTaille(e.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm font-semibold text-muted">
              Marque
              <input value={marque} onChange={(e) => setMarque(e.target.value)} className={inputClass} />
            </label>
          </div>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm font-semibold text-muted">
              Prix d’achat (€)
              <input inputMode="decimal" value={prixAchat} onChange={(e) => setPrixAchat(e.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm font-semibold text-muted">
              Prix de vente (€)
              <input inputMode="decimal" value={prixVente} onChange={(e) => setPrixVente(e.target.value)} className={inputClass} />
            </label>
          </div>

          {error && <p className="text-sm font-medium text-amber">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-[var(--radius-md)] bg-teal py-3.5 font-bold text-white shadow-md disabled:opacity-60"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>

        <div className="mt-2 border-t border-black/5 pt-4">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-sm font-semibold text-amber"
            >
              Supprimer cette pièce
            </button>
          ) : (
            <div className="flex flex-col gap-3 rounded-[var(--radius-md)] bg-white p-4">
              <p className="text-sm font-semibold text-ink">Supprimer définitivement cette pièce ?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-[var(--radius-md)] bg-amber px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {deleting ? 'Suppression…' : 'Confirmer'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold text-muted"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
