import { useState } from 'react'
import { ArrowLeft, ArrowRightLeft, Pencil, Plus, Trash2, Package, PackageMinus, ListPlus, X } from 'lucide-react'
import { PieceRow } from '../pieces/PieceRow'
import { computeBoxStats } from './boxStats'
import { deleteBox, assignPiecesToBox } from './mutateBox'
import type { Box } from './types'
import type { Piece } from '../pieces/types'

interface BoxDetailScreenProps {
  box: Box
  boxes: Box[]
  pieces: Piece[]
  urls: Record<string, string>
  onBack: () => void
  onEdit: (box: Box) => void
  onDeleted: () => void
  onChanged: () => void
  onAddArticle: (box: Box) => void
  onAddExisting: (box: Box) => void
  onSelectPiece: (piece: Piece) => void
}

function euros(cents: number): string {
  const abs = (Math.abs(cents) / 100).toFixed(2).replace('.', ',')
  return `${cents < 0 ? '−' : ''}${abs} €`
}

export function BoxDetailScreen({
  box,
  boxes,
  pieces,
  urls,
  onBack,
  onEdit,
  onDeleted,
  onChanged,
  onAddArticle,
  onAddExisting,
  onSelectPiece,
}: BoxDetailScreenProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const articles = pieces.filter((p) => p.box_id === box.id)
  const s = computeBoxStats(box, pieces)
  const progress = s.costCents > 0 ? Math.min(100, (s.revenueCents / s.costCents) * 100) : 0

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteBox(box.id)
      onDeleted()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <main className="fixed inset-0 z-40 flex flex-col bg-app text-ink">
      <header
        className="flex items-center justify-between gap-2 border-b border-black/5 bg-surface px-4 py-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-muted">
          <ArrowLeft size={18} /> Retour
        </button>
        <h1 className="truncate px-2 text-base font-bold text-teal-dark">{box.nom}</h1>
        <button
          type="button"
          onClick={() => onEdit(box)}
          className="flex items-center gap-1.5 text-sm font-semibold text-teal-dark"
        >
          <Pencil size={16} /> Modifier
        </button>
      </header>

      <div
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
          {/* Bilan de la box */}
          <div className="rounded-[var(--radius-card)] bg-gradient-to-br from-teal to-[#036b74] p-5 text-white shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Marge de la box</p>
            <p className="mt-2 text-4xl font-black tracking-tight">{euros(s.margeCents)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="opacity-80">Revenu réalisé</p>
                <p className="font-bold">{euros(s.revenueCents)}</p>
              </div>
              <div>
                <p className="opacity-80">Prix du lot</p>
                <p className="font-bold">{euros(s.costCents)}</p>
              </div>
            </div>
            {/* Progression de l'amortissement du lot. */}
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs opacity-90">
              {s.soldUnits}/{s.units} unité{s.units > 1 ? 's' : ''} vendue{s.soldUnits > 1 ? 's' : ''}
              {s.fullySold ? ' · lot soldé ✅' : s.costCents > 0 ? ` · ${Math.round(progress)} % du lot amorti` : ''}
            </p>
          </div>

          {/* Articles de la box */}
          <div className="flex items-center justify-between gap-2 px-1">
            <h2 className="font-bold text-ink">Articles ({s.articles})</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onAddExisting(box)}
                className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-teal-dark shadow-sm ring-1 ring-teal/30"
              >
                <ListPlus size={15} /> Existant
              </button>
              <button
                type="button"
                onClick={() => onAddArticle(box)}
                className="flex items-center gap-1.5 rounded-full bg-teal px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
              >
                <Plus size={15} /> Nouveau
              </button>
            </div>
          </div>

          {articles.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] bg-surface p-8 text-center shadow-sm">
              <Package size={28} className="text-teal-dark/50" />
              <p className="text-sm text-muted">
                Cette box est vide. Choisis des articles déjà créés à y ranger, ou crée-en un nouveau.
              </p>
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onAddExisting(box)}
                  className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                >
                  <ListPlus size={16} /> Choisir des articles
                </button>
                <button
                  type="button"
                  onClick={() => onAddArticle(box)}
                  className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-app px-4 py-2.5 text-sm font-semibold text-teal-dark ring-1 ring-teal/30"
                >
                  <Plus size={16} /> Nouvel article
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {articles.map((piece) => {
                // Marge allouée = quantité × (prix de vente − coût unitaire réparti du lot).
                // Réalisée si vendu, potentielle si en stock (dès qu'un prix de vente est renseigné).
                const marge =
                  piece.prix_vente_cents != null
                    ? Math.round((piece.prix_vente_cents - s.unitCostCents) * (piece.quantite ?? 1))
                    : null
                return (
                  <BoxArticleRow
                    key={piece.id}
                    piece={piece}
                    photoUrl={piece.photo_path ? urls[piece.photo_path] : undefined}
                    marginCents={marge}
                    otherBoxes={boxes.filter((b) => b.id !== box.id)}
                    onSelect={onSelectPiece}
                    onChanged={onChanged}
                  />
                )
              })}
            </div>
          )}

          {/* Suppression de la box */}
          <div className="pt-2">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-amber"
              >
                <Trash2 size={16} /> Supprimer cette box
              </button>
            ) : (
              <div className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-surface p-4 shadow-sm">
                <p className="text-sm font-semibold text-ink">
                  Supprimer cette box ? Les articles ne sont pas supprimés, ils redeviennent des articles à l'unité.
                </p>
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

interface BoxArticleRowProps {
  piece: Piece
  photoUrl?: string
  marginCents: number | null
  /** Autres box vers lesquelles déplacer l'article (la box courante exclue). */
  otherBoxes: Box[]
  onSelect: (piece: Piece) => void
  onChanged: () => void
}

/**
 * Ligne d'article dans une box, avec actions rapides de correction :
 * « Retirer » (redevient un article à l'unité) et « Déplacer » vers une autre box.
 */
function BoxArticleRow({ piece, photoUrl, marginCents, otherBoxes, onSelect, onChanged }: BoxArticleRowProps) {
  const [moving, setMoving] = useState(false)
  const [busy, setBusy] = useState(false)

  // Rattache l'article ailleurs (ou le détache si null). L'article quitte alors cette box.
  async function reassign(boxId: string | null) {
    setBusy(true)
    try {
      await assignPiecesToBox([piece.id], boxId)
      onChanged()
    } catch {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-[var(--radius-md)] bg-surface p-1.5 shadow-sm">
      <PieceRow piece={piece} photoUrl={photoUrl} onSelect={onSelect} marginCents={marginCents} />

      {moving ? (
        <div className="flex flex-col gap-1.5 rounded-[var(--radius-sm)] bg-app p-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-muted">Déplacer vers…</span>
            <button
              type="button"
              onClick={() => setMoving(false)}
              className="flex items-center gap-1 text-xs font-semibold text-muted"
            >
              <X size={13} /> Annuler
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {otherBoxes.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => reassign(b.id)}
                disabled={busy}
                className="rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-teal-dark shadow-sm ring-1 ring-teal/30 disabled:opacity-60"
              >
                {b.nom}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-2 px-1 pb-0.5">
          <button
            type="button"
            onClick={() => reassign(null)}
            disabled={busy}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber disabled:opacity-60"
          >
            <PackageMinus size={14} /> Retirer de la box
          </button>
          {otherBoxes.length > 0 && (
            <button
              type="button"
              onClick={() => setMoving(true)}
              disabled={busy}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-dark disabled:opacity-60"
            >
              <ArrowRightLeft size={14} /> Déplacer
            </button>
          )}
        </div>
      )}
    </div>
  )
}
