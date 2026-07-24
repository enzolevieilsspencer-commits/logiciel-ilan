import { useState, type FormEvent } from 'react'
import { Chips } from '../../components/ui/Chips'
import { CATEGORIES, COULEURS, eurosToCents } from './types'
import { createPiece } from './addPiece'

interface AddPieceScreenProps {
  onCancel: () => void
  onAdded: () => void
}

export function AddPieceScreen({ onCancel, onAdded }: AddPieceScreenProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [categorie, setCategorie] = useState<string | null>(null)
  const [couleur, setCouleur] = useState<string | null>(null)
  const [taille, setTaille] = useState('')
  const [marque, setMarque] = useState('')
  const [prixAchat, setPrixAchat] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const { photoSkipped } = await createPiece({
        photo,
        categorie,
        couleur,
        taille,
        marque,
        prixAchatCents,
      })
      if (photoSkipped) {
        // La pièce est créée ; on prévient juste que la photo n'a pas pu être enregistrée.
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

  return (
    <main className="min-h-screen bg-app text-ink p-5">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onCancel} className="text-sm font-semibold text-muted">
            ← Annuler
          </button>
          <h1 className="text-lg font-bold text-teal-dark">Nouvelle pièce</h1>
          <span className="w-14" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm font-semibold text-muted">
            Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
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
            className="rounded-[var(--radius-md)] bg-teal py-3.5 font-bold text-white shadow-md disabled:opacity-60"
          >
            {submitting ? 'Ajout…' : 'Ajouter au stock'}
          </button>
        </form>
      </div>
    </main>
  )
}
