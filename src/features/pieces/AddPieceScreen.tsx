import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, Camera, Check, Images } from 'lucide-react'
import { Chips } from '../../components/ui/Chips'
import { CATEGORIES, COULEURS, eurosToCents } from './types'
import { createPiece } from './addPiece'

interface AddPieceScreenProps {
  onCancel: () => void
  onAdded: () => void
}

export function AddPieceScreen({ onCancel, onAdded }: AddPieceScreenProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [categorie, setCategorie] = useState<string | null>(null)
  const [couleur, setCouleur] = useState<string | null>(null)
  const [taille, setTaille] = useState('')
  const [marque, setMarque] = useState('')
  const [prixAchat, setPrixAchat] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!photo) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(photo)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const prixAchatCents = eurosToCents(prixAchat)
    if (prixAchat.trim() !== '' && prixAchatCents === null) {
      setError('Prix d’achat invalide.')
      return
    }
    setSubmitting(true)
    try {
      const { photoSkipped } = await createPiece({ photo, categorie, couleur, taille, marque, prixAchatCents })
      if (photoSkipped) {
        alert('Pièce ajoutée, mais la photo n’a pas pu être enregistrée. Tu pourras la rajouter plus tard.')
      }
      onAdded()
    } catch {
      setError('Impossible d’ajouter la pièce. Réessaie.')
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full min-w-0 rounded-[var(--radius-md)] bg-app px-4 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-teal'
  const labelClass = 'flex min-w-0 flex-1 flex-col gap-1 text-sm font-semibold text-muted'

  return (
    <main className="fixed inset-0 z-40 flex flex-col bg-app text-ink">
      {/* Header fixe */}
      <header
        className="flex items-center justify-between gap-2 border-b border-black/5 bg-surface px-4 py-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted"
        >
          <ArrowLeft size={18} /> Annuler
        </button>
        <h1 className="text-base font-bold text-teal-dark">Nouvelle pièce</h1>
        <span className="w-16" />
      </header>

      {/* Corps scrollable */}
      <form
        id="add-piece-form"
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-5"
      >
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
          {/* Photo : caméra ou galerie */}
          <section className="flex flex-col gap-2.5">
            <div className="flex h-48 items-center justify-center overflow-hidden rounded-[var(--radius-card)] border-2 border-dashed border-teal/40 bg-surface">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-teal-dark">
                  <Camera size={30} />
                  <span className="text-sm font-semibold">Ajoute une photo</span>
                </span>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-teal py-3 text-sm font-semibold text-white shadow-sm"
              >
                <Camera size={18} /> {previewUrl ? 'Reprendre' : 'Photo'}
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-surface py-3 text-sm font-semibold text-teal-dark ring-1 ring-teal/30"
              >
                <Images size={18} /> Galerie
              </button>
            </div>

            {/* Caméra : capture directe (mobile). */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            {/* Galerie / pellicule : sélection d'une image existante. */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </section>

          {/* Détails de la pièce */}
          <section className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
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
                Marque <span className="font-normal">(option.)</span>
                <input value={marque} onChange={(e) => setMarque(e.target.value)} className={inputClass} />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
              Prix d’achat (€)
              <input
                inputMode="decimal"
                value={prixAchat}
                onChange={(e) => setPrixAchat(e.target.value)}
                placeholder="ex. 6"
                className={inputClass}
              />
            </label>
          </section>

          {error && <p className="text-sm font-medium text-amber">{error}</p>}
        </div>
      </form>

      {/* Footer fixe : action principale toujours visible */}
      <footer
        className="border-t border-black/5 bg-surface px-4 pt-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <div className="mx-auto w-full max-w-lg">
          <button
            type="submit"
            form="add-piece-form"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-teal py-3.5 font-bold text-white shadow-md disabled:opacity-60"
          >
            <Check size={18} /> {submitting ? 'Ajout…' : 'Ajouter au stock'}
          </button>
        </div>
      </footer>
    </main>
  )
}
