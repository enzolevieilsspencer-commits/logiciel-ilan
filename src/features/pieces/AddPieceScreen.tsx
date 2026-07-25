import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Camera, Check } from 'lucide-react'
import { Chips } from '../../components/ui/Chips'
import { CATEGORIES, COULEURS, eurosToCents } from './types'
import { createPiece } from './addPiece'

interface AddPieceScreenProps {
  onCancel: () => void
  onAdded: () => void
}

export function AddPieceScreen({ onCancel, onAdded }: AddPieceScreenProps) {
  const [photo, setPhoto] = useState<File | null>(null)
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
    'rounded-[var(--radius-md)] bg-app px-4 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-teal'
  const labelClass = 'flex flex-1 flex-col gap-1 text-sm font-semibold text-muted'

  return (
    <main className="min-h-screen bg-app p-4 text-ink md:p-8">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted"
          >
            <ArrowLeft size={18} /> Annuler
          </button>
          <h1 className="text-lg font-bold text-teal-dark">Nouvelle pièce</h1>
          <span className="w-16" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
          {/* Zone photo cliquable */}
          <label className="flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-[var(--radius-card)] border-2 border-dashed border-teal/40 bg-app">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-teal-dark">
                <Camera size={30} />
                <span className="text-sm font-semibold">Prendre une photo</span>
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="hidden"
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

          {error && <p className="text-sm font-medium text-amber">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-teal py-3.5 font-bold text-white shadow-md disabled:opacity-60"
          >
            <Check size={18} /> {submitting ? 'Ajout…' : 'Ajouter au stock'}
          </button>
        </form>
      </div>
    </main>
  )
}
