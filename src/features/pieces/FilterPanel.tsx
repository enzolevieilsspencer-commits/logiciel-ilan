import type { Piece } from './types'
import { EMPTY_FILTERS, distinctValues, type FilterKey, type PieceFilters } from './filters'

const FACETS: { key: FilterKey; label: string }[] = [
  { key: 'categorie', label: 'Catégorie' },
  { key: 'couleur', label: 'Couleur' },
  { key: 'taille', label: 'Taille' },
  { key: 'marque', label: 'Marque' },
]

interface FilterPanelProps {
  pieces: Piece[]
  filters: PieceFilters
  onChange: (filters: PieceFilters) => void
  onClose: () => void
}

export function FilterPanel({ pieces, filters, onChange, onClose }: FilterPanelProps) {
  function toggle(key: FilterKey, value: string) {
    onChange({ ...filters, [key]: filters[key] === value ? null : value })
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-app">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="text-sm font-semibold text-amber">
            Effacer
          </button>
          <h1 className="text-lg font-bold text-teal-dark">Filtrer</h1>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-teal-dark">
            Fermer
          </button>
        </div>

        {FACETS.map((facet) => {
          const values = distinctValues(pieces, facet.key)
          if (values.length === 0) return null
          return (
            <div key={facet.key} className="flex flex-col gap-2 text-sm font-semibold text-muted">
              {facet.label}
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const selected = filters[facet.key] === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggle(facet.key, value)}
                      aria-pressed={selected}
                      className={
                        selected
                          ? 'rounded-full bg-teal px-3.5 py-2 text-sm font-semibold text-white'
                          : 'rounded-full border border-[color:var(--color-teal)]/25 bg-white px-3.5 py-2 text-sm text-muted'
                      }
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
