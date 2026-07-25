import { useState } from 'react'
import { PieceRow } from './PieceRow'
import { FilterPanel } from './FilterPanel'
import { EMPTY_FILTERS, activeFilterCount, applyFilters, type PieceFilters } from './filters'
import type { Piece } from './types'

interface StockScreenProps {
  pieces: Piece[]
  urls: Record<string, string>
  loading: boolean
  error: string | null
  onSelect: (piece: Piece) => void
}

export function StockScreen({ pieces, urls, loading, error, onSelect }: StockScreenProps) {
  const [filters, setFilters] = useState<PieceFilters>(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(false)

  const count = activeFilterCount(filters)
  const filtered = applyFilters(pieces, filters)
  const hasStock = !loading && !error && pieces.length > 0

  return (
    <div className="mx-auto flex max-w-md flex-col gap-3 p-4">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl font-bold text-teal-dark">Mon stock</h1>
        {hasStock && (
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-teal-dark shadow-sm"
          >
            🔎 Filtrer
            {count > 0 && (
              <span className="rounded-full bg-teal px-1.5 text-xs font-bold text-white">{count}</span>
            )}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[74px] animate-pulse rounded-[var(--radius-md)] bg-white/70" />
          ))}
        </div>
      )}

      {!loading && error && <p className="px-1 text-sm text-amber">{error}</p>}

      {!loading && !error && pieces.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <span className="text-4xl">📦</span>
          <p className="font-semibold text-ink">Ton stock est vide</p>
          <p className="text-sm text-muted">Ajoute ta première pièce avec le bouton ＋.</p>
        </div>
      )}

      {hasStock && filtered.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <span className="text-4xl">🔍</span>
          <p className="font-semibold text-ink">Aucune pièce ne correspond à tes filtres</p>
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="text-sm font-semibold text-teal-dark underline"
          >
            Effacer les filtres
          </button>
        </div>
      )}

      {hasStock && filtered.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {filtered.map((piece) => (
            <PieceRow
              key={piece.id}
              piece={piece}
              photoUrl={piece.photo_path ? urls[piece.photo_path] : undefined}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      {showFilters && (
        <FilterPanel
          pieces={pieces}
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}
