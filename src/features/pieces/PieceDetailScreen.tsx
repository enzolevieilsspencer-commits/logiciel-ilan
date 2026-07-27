import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Camera, CheckCircle2, RotateCcw, Shirt, Tag, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Chips } from '../../components/ui/Chips'
import { CATEGORIES, COULEURS, centsToEuros, eurosToCents, type Piece } from './types'
import { uploadPhoto, deletePhoto } from './storage'
import { computeMargin } from '../../lib/derive'
import { updatePiece, deletePiece, sellPiece, restockPiece, type PiecePatch } from './updatePiece'

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
  const [statusBusy, setStatusBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function handleSell() {
    setError(null)
    const prixVenteCents = eurosToCents(prixVente)
    if (prixVenteCents === null) {
      setError('Indique le prix de vente pour marquer comme vendue.')
      return
    }
    setStatusBusy(true)
    try {
      await sellPiece(piece.id, prixVenteCents)
      onChanged()
    } catch {
      setError('Impossible de marquer comme vendue. Réessaie.')
      setStatusBusy(false)
    }
  }

  async function handleRestock() {
    setError(null)
    setStatusBusy(true)
    try {
      await restockPiece(piece.id)
      onChanged()
    } catch {
      setError('Impossible de remettre en stock. Réessaie.')
      setStatusBusy(false)
    }
  }

  const inputClass =
    'w-full min-w-0 rounded-[var(--radius-md)] bg-app px-4 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-teal'
  const labelClass = 'flex min-w-0 flex-1 flex-col gap-1 text-sm font-semibold text-muted'
  const photoSrc = previewUrl ?? signedUrl

  const margin = computeMargin(eurosToCents(prixAchat), eurosToCents(prixVente))
  let margeLabel: string | null = null
  let margePositive = true
  if (margin) {
    margePositive = margin.margeCents >= 0
    const eurosAbs = (Math.abs(margin.margeCents) / 100).toFixed(2).replace('.', ',')
    const pctPart = margin.pct === null ? '' : ` · ${Math.round(margin.pct)} %`
    margeLabel = `${margePositive ? '+' : '−'}${eurosAbs} €${pctPart}`
  }

  return (
    <main className="fixed inset-0 z-40 flex flex-col bg-app text-ink">
      {/* Header fixe */}
      <header
        className="flex items-center justify-between gap-2 border-b border-black/5 bg-surface px-4 py-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted"
        >
          <ArrowLeft size={18} /> Retour
        </button>
        <h1 className="text-base font-bold text-teal-dark">Fiche pièce</h1>
        <span className="w-16" />
      </header>

      {/* Corps scrollable */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
          <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-sm">
          {photoSrc ? (
            <img src={photoSrc} alt="" className="mx-auto max-h-[60vh] w-full object-contain" />
          ) : (
            <div className="flex h-56 items-center justify-center">
              <Shirt size={56} className="text-teal-dark/40" />
            </div>
          )}
          <label className="absolute bottom-3 right-3 flex cursor-pointer items-center gap-2 rounded-full bg-surface/90 px-3 py-1.5 text-sm font-semibold text-teal-dark shadow backdrop-blur">
            <Camera size={16} /> Photo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewPhoto(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>

        {margeLabel && (
          <div className="rounded-[var(--radius-card)] bg-surface p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Marge</p>
            <p className={`text-3xl font-extrabold ${margePositive ? 'text-green' : 'text-amber'}`}>{margeLabel}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
          <div className="flex flex-col gap-2 text-sm font-semibold text-muted">
            Catégorie
            <Chips options={CATEGORIES} value={categorie} onChange={setCategorie} />
          </div>

          <div className="flex flex-col gap-2 text-sm font-semibold text-muted">
            Couleur
            <Chips options={COULEURS} value={couleur} onChange={setCouleur} />
          </div>

          <div className="flex gap-3">
            <label className={labelClass}>
              Taille
              <input value={taille} onChange={(e) => setTaille(e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              Marque
              <input value={marque} onChange={(e) => setMarque(e.target.value)} className={inputClass} />
            </label>
          </div>

          <div className="flex gap-3">
            <label className={labelClass}>
              Prix d’achat (€)
              <input inputMode="decimal" value={prixAchat} onChange={(e) => setPrixAchat(e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
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

        <div className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
          {piece.statut === 'vendue' ? (
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-green">
                <CheckCircle2 size={18} />
                Vendu{piece.sold_at ? ` le ${new Date(piece.sold_at).toLocaleDateString('fr-FR')}` : ''}
              </p>
              <button
                type="button"
                onClick={handleRestock}
                disabled={statusBusy}
                className="flex items-center gap-2 self-start rounded-[var(--radius-md)] bg-app px-4 py-2 text-sm font-semibold text-teal-dark disabled:opacity-60"
              >
                <RotateCcw size={16} /> {statusBusy ? '…' : 'Remettre en stock'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted">
                Cette pièce est <span className="font-semibold text-teal-dark">en stock</span>.
              </p>
              <button
                type="button"
                onClick={handleSell}
                disabled={statusBusy}
                className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-green py-3 font-bold text-white shadow-md disabled:opacity-60"
              >
                <Tag size={18} /> {statusBusy ? 'Enregistrement…' : 'Marquer comme vendue'}
              </button>
            </div>
          )}
        </div>

        <div>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-amber"
            >
              <Trash2 size={16} /> Supprimer cette pièce
            </button>
          ) : (
            <div className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-surface p-4 shadow-sm">
              <p className="text-sm font-semibold text-ink">Supprimer définitivement cette pièce ?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-[var(--radius-md)] bg-amber px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  <Trash2 size={16} /> {deleting ? 'Suppression…' : 'Confirmer'}
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
      </div>
    </main>
  )
}
