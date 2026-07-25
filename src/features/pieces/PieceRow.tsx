import { Shirt } from 'lucide-react'
import { computeMargin, isStale } from '../../lib/derive'
import type { Piece } from './types'

interface PieceRowProps {
  piece: Piece
  photoUrl?: string
  onSelect: (piece: Piece) => void
}

function formatMargeEuros(margeCents: number): string {
  const abs = (Math.abs(margeCents) / 100).toFixed(2).replace('.', ',')
  return `${margeCents < 0 ? '−' : '+'}${abs} €`
}

export function PieceRow({ piece, photoUrl, onSelect }: PieceRowProps) {
  const meta = [piece.categorie, piece.couleur, piece.taille].filter(Boolean).join(' · ')
  const title = piece.marque ? `${piece.categorie ?? 'Pièce'} · ${piece.marque}` : piece.categorie ?? 'Pièce'
  const vendue = piece.statut === 'vendue'
  const marge = vendue ? computeMargin(piece.prix_achat_cents, piece.prix_vente_cents) : null
  const stagnante = !vendue && isStale(piece.created_at)

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
          <Shirt size={22} className="text-teal-dark/60" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{title}</p>
        <p className="truncate text-sm text-muted">{meta || '—'}</p>
      </div>
      {vendue ? (
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full bg-[color:var(--color-green)]/15 px-2.5 py-1 text-xs font-semibold text-green">
            vendu
          </span>
          {marge && (
            <span className={`text-sm font-bold ${marge.margeCents >= 0 ? 'text-green' : 'text-amber'}`}>
              {formatMargeEuros(marge.margeCents)}
            </span>
          )}
        </div>
      ) : (
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full bg-app px-2.5 py-1 text-xs font-semibold text-teal-dark">
            en stock
          </span>
          {stagnante && <span className="text-xs font-semibold text-amber">à brader</span>}
        </div>
      )}
    </button>
  )
}
