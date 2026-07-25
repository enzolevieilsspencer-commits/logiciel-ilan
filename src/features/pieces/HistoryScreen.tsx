import { Receipt } from 'lucide-react'
import { PieceRow } from './PieceRow'
import type { Piece } from './types'

interface HistoryScreenProps {
  pieces: Piece[]
  urls: Record<string, string>
  loading: boolean
  error: string | null
  onSelect: (piece: Piece) => void
}

export function HistoryScreen({ pieces, urls, loading, error, onSelect }: HistoryScreenProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3 p-4 md:p-6">
      <h1 className="px-1 text-2xl font-bold text-ink">Historique</h1>

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
            <Receipt size={30} />
          </span>
          <p className="font-semibold text-ink">Pas encore de vente</p>
          <p className="text-sm text-muted">Ta première marge s'affichera ici.</p>
        </div>
      )}

      {!loading && !error && pieces.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {pieces.map((piece) => (
            <PieceRow
              key={piece.id}
              piece={piece}
              photoUrl={piece.photo_path ? urls[piece.photo_path] : undefined}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
