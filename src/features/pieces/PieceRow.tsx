import type { Piece } from './types'

interface PieceRowProps {
  piece: Piece
  photoUrl?: string
  onSelect: (piece: Piece) => void
}

export function PieceRow({ piece, photoUrl, onSelect }: PieceRowProps) {
  const meta = [piece.categorie, piece.couleur, piece.taille].filter(Boolean).join(' · ')
  const title = piece.marque ? `${piece.categorie ?? 'Pièce'} · ${piece.marque}` : piece.categorie ?? 'Pièce'

  return (
    <button
      type="button"
      onClick={() => onSelect(piece)}
      className="flex w-full items-center gap-3 rounded-[var(--radius-md)] bg-white p-2.5 text-left shadow-sm"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-app">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl">👕</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{title}</p>
        <p className="truncate text-sm text-muted">{meta || '—'}</p>
      </div>
      <span className="shrink-0 rounded-full bg-app px-2.5 py-1 text-xs font-semibold text-teal-dark">
        en stock
      </span>
    </button>
  )
}
