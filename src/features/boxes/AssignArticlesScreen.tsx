import { useState } from 'react'
import { ArrowLeft, Check, Shirt, PackageSearch } from 'lucide-react'
import { assignPiecesToBox } from './mutateBox'
import type { Box } from './types'
import type { Piece } from '../pieces/types'

interface AssignArticlesScreenProps {
  box: Box
  pieces: Piece[]
  urls: Record<string, string>
  onCancel: () => void
  onDone: () => void
}

/**
 * Éditeur d'appartenance d'une box : liste de TOUS les articles avec cases à cocher.
 * Les articles déjà dans la box sont pré-cochés (on peut donc en ajouter ou en retirer).
 */
export function AssignArticlesScreen({ box, pieces, urls, onCancel, onDone }: AssignArticlesScreenProps) {
  // Sélection initiale = articles déjà dans cette box.
  const initial = new Set(pieces.filter((p) => p.box_id === box.id).map((p) => p.id))
  const [selected, setSelected] = useState<Set<string>>(initial)
  const [submitting, setSubmitting] = useState(false)

  // Un article ne peut appartenir qu'à une seule box : on exclut ceux déjà
  // rattachés à une AUTRE box. Restent les articles libres + ceux de cette box.
  const list = pieces
    .filter((p) => p.box_id == null || p.box_id === box.id)
    .sort((a, b) => (a.statut === b.statut ? 0 : a.statut === 'en_stock' ? -1 : 1))

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleConfirm() {
    setSubmitting(true)
    try {
      const toAdd = [...selected].filter((id) => !initial.has(id))
      const toRemove = [...initial].filter((id) => !selected.has(id))
      await assignPiecesToBox(toAdd, box.id)
      await assignPiecesToBox(toRemove, null)
      onDone()
    } catch {
      setSubmitting(false)
    }
  }

  const changed =
    [...selected].some((id) => !initial.has(id)) || [...initial].some((id) => !selected.has(id))

  return (
    <main className="fixed inset-0 z-40 flex flex-col bg-app text-ink">
      <header
        className="flex items-center justify-between gap-2 border-b border-black/5 bg-surface px-4 py-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 text-sm font-semibold text-muted">
          <ArrowLeft size={18} /> Annuler
        </button>
        <h1 className="truncate px-2 text-base font-bold text-teal-dark">Articles de « {box.nom} »</h1>
        <span className="w-16" />
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-2.5">
          {list.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-teal shadow-sm">
                <PackageSearch size={30} />
              </span>
              <p className="font-semibold text-ink">Aucun article</p>
              <p className="max-w-xs text-sm text-muted">Crée d'abord des articles, puis tu pourras les ranger ici.</p>
            </div>
          ) : (
            list.map((piece) => {
              const on = selected.has(piece.id)
              const photoUrl = piece.photo_path ? urls[piece.photo_path] : undefined
              const title = piece.marque
                ? `${piece.categorie ?? 'Pièce'} · ${piece.marque}`
                : piece.categorie ?? 'Pièce'
              const meta = [piece.couleur, piece.taille].filter(Boolean).join(' · ')
              return (
                <button
                  key={piece.id}
                  type="button"
                  onClick={() => toggle(piece.id)}
                  className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] bg-surface p-2.5 text-left shadow-sm ring-2 transition-colors ${
                    on ? 'ring-teal' : 'ring-transparent'
                  }`}
                >
                  {/* Case à cocher */}
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                      on ? 'border-teal bg-teal text-white' : 'border-muted/40 text-transparent'
                    }`}
                  >
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-app">
                    {photoUrl ? (
                      <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Shirt size={20} className="text-teal-dark/60" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate font-semibold text-ink">
                      <span className="truncate">{title}</span>
                      {piece.quantite > 1 && (
                        <span className="shrink-0 rounded-full bg-app px-1.5 text-xs font-bold text-teal-dark">
                          ×{piece.quantite}
                        </span>
                      )}
                    </p>
                    <p className="truncate text-sm text-muted">
                      {meta || '—'}
                      {piece.statut === 'vendue' ? ' · vendu' : ''}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      <footer
        className="border-t border-black/5 bg-surface px-4 pt-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <div className="mx-auto w-full max-w-lg">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || !changed}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-teal py-3.5 font-bold text-white shadow-md disabled:opacity-60"
          >
            <Check size={18} />
            {submitting ? 'Enregistrement…' : `Enregistrer (${selected.size} sélectionné${selected.size > 1 ? 's' : ''})`}
          </button>
        </div>
      </footer>
    </main>
  )
}
