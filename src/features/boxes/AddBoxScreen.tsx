import { useState, type FormEvent } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { eurosToCents, centsToEuros } from '../pieces/types'
import { createBox, updateBox } from './mutateBox'
import type { Box } from './types'

interface AddBoxScreenProps {
  box?: Box | null
  onCancel: () => void
  onSaved: () => void
}

/** Création / édition d'une box (lot d'achat). */
export function AddBoxScreen({ box, onCancel, onSaved }: AddBoxScreenProps) {
  const editing = !!box
  const [nom, setNom] = useState(box?.nom ?? '')
  const [prixAchat, setPrixAchat] = useState(centsToEuros(box?.prix_achat_cents ?? null))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (nom.trim() === '') {
      setError('Donne un nom à la box.')
      return
    }
    const prixAchatCents = eurosToCents(prixAchat)
    if (prixAchat.trim() !== '' && prixAchatCents === null) {
      setError('Prix du lot invalide.')
      return
    }
    setSubmitting(true)
    try {
      const input = { nom: nom.trim(), prixAchatCents }
      if (box) await updateBox(box.id, input)
      else await createBox(input)
      onSaved()
    } catch {
      setError('Impossible d’enregistrer la box. Réessaie.')
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full min-w-0 rounded-[var(--radius-md)] bg-app px-4 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-teal'

  return (
    <main className="fixed inset-0 z-40 flex flex-col bg-app text-ink">
      <header
        className="flex items-center justify-between gap-2 border-b border-black/5 bg-surface px-4 py-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 text-sm font-semibold text-muted">
          <ArrowLeft size={18} /> Annuler
        </button>
        <h1 className="text-base font-bold text-teal-dark">{editing ? 'Modifier la box' : 'Nouvelle box'}</h1>
        <span className="w-16" />
      </header>

      <form id="box-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-5 rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
          <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
            Nom de la box
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex. Friperie mars"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
            Prix du lot (€)
            <input
              inputMode="decimal"
              value={prixAchat}
              onChange={(e) => setPrixAchat(e.target.value)}
              placeholder="ex. 50"
              className={inputClass}
            />
            <span className="text-xs font-normal text-muted">
              Le coût est réparti automatiquement sur les articles de la box.
            </span>
          </label>

          {error && <p className="text-sm font-medium text-amber">{error}</p>}
        </div>
      </form>

      <footer
        className="border-t border-black/5 bg-surface px-4 pt-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <div className="mx-auto w-full max-w-lg">
          <button
            type="submit"
            form="box-form"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-teal py-3.5 font-bold text-white shadow-md disabled:opacity-60"
          >
            <Check size={18} /> {submitting ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Créer la box'}
          </button>
        </div>
      </footer>
    </main>
  )
}
