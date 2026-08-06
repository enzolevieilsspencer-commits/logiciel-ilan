import { Boxes, Plus } from 'lucide-react'
import { computeBoxStats } from './boxStats'
import type { Box } from './types'
import type { Piece } from '../pieces/types'

interface BoxListScreenProps {
  boxes: Box[]
  pieces: Piece[]
  loading: boolean
  error: string | null
  onSelect: (box: Box) => void
  onAdd: () => void
}

function euros(cents: number): string {
  const abs = (Math.abs(cents) / 100).toFixed(2).replace('.', ',')
  return `${cents < 0 ? '−' : ''}${abs} €`
}

export function BoxListScreen({ boxes, pieces, loading, error, onSelect, onAdd }: BoxListScreenProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3 p-4 md:p-6">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-2xl font-bold text-ink">Mes box</h1>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-full bg-teal px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm"
        >
          <Plus size={16} /> Nouvelle box
        </button>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-[var(--radius-card)] bg-surface/70" />
          ))}
        </div>
      )}

      {!loading && error && <p className="px-1 text-sm text-amber">{error}</p>}

      {!loading && !error && boxes.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-teal shadow-sm">
            <Boxes size={30} />
          </span>
          <p className="font-semibold text-ink">Aucune box pour l'instant</p>
          <p className="max-w-xs text-sm text-muted">
            Crée une box pour un lot acheté, ajoute-y tes articles et suis ta marge dessus.
          </p>
        </div>
      )}

      {!loading && !error && boxes.length > 0 && (
        <div className="flex flex-col gap-3">
          {boxes.map((box) => {
            const s = computeBoxStats(box, pieces)
            const positive = s.margeCents >= 0
            const progress = s.costCents > 0 ? Math.min(100, (s.revenueCents / s.costCents) * 100) : 0
            return (
              <button
                key={box.id}
                type="button"
                onClick={() => onSelect(box)}
                className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{box.nom}</p>
                    <p className="text-xs text-muted">
                      {s.soldUnits}/{s.units} vendu{s.units > 1 ? 's' : ''} · lot {euros(s.costCents)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-lg font-extrabold ${positive ? 'text-green' : 'text-amber'}`}>
                      {euros(s.margeCents)}
                    </p>
                    <p className="text-[11px] text-muted">marge</p>
                  </div>
                </div>
                {/* Progression de l'amortissement du lot (revenu vs coût). */}
                <div className="h-2 overflow-hidden rounded-full bg-app">
                  <div
                    className={`h-full rounded-full ${positive && s.costCents > 0 ? 'bg-green' : 'bg-teal'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
