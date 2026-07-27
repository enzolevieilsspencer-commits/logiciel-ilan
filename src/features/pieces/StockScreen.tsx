import { useState } from 'react'
import { Package, Search, SlidersHorizontal } from 'lucide-react'
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

/** Recherche plein-texte simple sur marque / catégorie / couleur / taille. */
function matchesQuery(piece: Piece, q: string): boolean {
  if (q === '') return true
  const haystack = [piece.marque, piece.categorie, piece.couleur, piece.taille]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export function StockScreen({ pieces, urls, loading, error, onSelect }: StockScreenProps) {
  const [filters, setFilters] = useState<PieceFilters>(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [query, setQuery] = useState('')

  const count = activeFilterCount(filters)
  const q = query.trim().toLowerCase()
  const filtered = applyFilters(pieces, filters).filter((p) => matchesQuery(p, q))
  const hasStock = !loading && !error && pieces.length > 0

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3 p-4 md:p-6">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-2xl font-bold text-ink">Mon stock</h1>
        {hasStock && (
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-teal-dark shadow-sm"
          >
            <SlidersHorizontal size={15} /> Filtrer
            {count > 0 && (
              <span className="rounded-full bg-teal px-1.5 text-xs font-bold text-white">{count}</span>
            )}
          </button>
        )}
      </div>

      {hasStock && (
        <div className="relative px-1">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (marque, catégorie…)"
            className="w-full rounded-[var(--radius-md)] bg-surface py-2.5 pl-10 pr-4 text-sm text-ink shadow-sm outline-none focus:ring-2 focus:ring-teal"
          />
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[74px] animate-pulse rounded-[var(--radius-md)] bg-surface/70" />
          ))}
        </div>
      )}

      {!loading && error && <p className="px-1 text-sm text-amber">{error}</p>}

      {!loading && !error && pieces.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-teal shadow-sm">
            <Package size={30} />
          </span>
          <p className="font-semibold text-ink">Ton stock est vide</p>
          <p className="text-sm text-muted">Ajoute ta première pièce avec le bouton ＋.</p>
        </div>
      )}

      {hasStock && filtered.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-teal shadow-sm">
            <Search size={30} />
          </span>
          <p className="font-semibold text-ink">Aucune pièce ne correspond à ta recherche</p>
          <button
            type="button"
            onClick={() => {
              setFilters(EMPTY_FILTERS)
              setQuery('')
            }}
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
