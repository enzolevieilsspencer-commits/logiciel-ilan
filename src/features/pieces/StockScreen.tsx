import { PieceRow } from './PieceRow'
import type { Piece } from './types'

interface StockScreenProps {
  pieces: Piece[]
  urls: Record<string, string>
  loading: boolean
  error: string | null
  onSelect: (piece: Piece) => void
}

export function StockScreen({ pieces, urls, loading, error, onSelect }: StockScreenProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-3 p-4">
      <h1 className="px-1 text-xl font-bold text-teal-dark">Mon stock</h1>

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
