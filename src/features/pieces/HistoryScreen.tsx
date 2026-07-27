import { Download, Receipt } from 'lucide-react'
import { PieceRow } from './PieceRow'
import { piecesToCsv, downloadCsv } from './exportCsv'
import { isoToDateInput } from './types'
import type { Piece } from './types'

interface HistoryScreenProps {
  pieces: Piece[]
  urls: Record<string, string>
  loading: boolean
  error: string | null
  onSelect: (piece: Piece) => void
}

function euros(cents: number): string {
  const abs = (Math.abs(cents) / 100).toFixed(2).replace('.', ',')
  return `${cents < 0 ? '−' : ''}${abs} €`
}

/** Totaux dérivés des ventes (jamais stockés). */
function summarize(pieces: Piece[]) {
  let ca = 0
  let benefices = 0
  let sommeAchat = 0
  for (const p of pieces) {
    if (p.prix_vente_cents != null) ca += p.prix_vente_cents
    if (p.prix_vente_cents != null && p.prix_achat_cents != null) {
      benefices += p.prix_vente_cents - p.prix_achat_cents
      sommeAchat += p.prix_achat_cents
    }
  }
  const margePct = sommeAchat > 0 ? Math.round((benefices / sommeAchat) * 100) : null
  return { ca, benefices, margePct, count: pieces.length }
}

export function HistoryScreen({ pieces, urls, loading, error, onSelect }: HistoryScreenProps) {
  const hasSales = !loading && !error && pieces.length > 0
  const stats = summarize(pieces)

  function handleExport() {
    downloadCsv(`ventes-${isoToDateInput(null)}.csv`, piecesToCsv(pieces))
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3 p-4 md:p-6">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-2xl font-bold text-ink">Historique</h1>
        {hasSales && (
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-teal-dark shadow-sm"
          >
            <Download size={15} /> Export CSV
          </button>
        )}
      </div>

      {/* Résumé des ventes */}
      {hasSales && (
        <div className="grid grid-cols-3 gap-2 rounded-[var(--radius-card)] bg-surface p-4 shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted">Bénéfices</p>
            <p className={`mt-0.5 text-lg font-extrabold ${stats.benefices >= 0 ? 'text-green' : 'text-amber'}`}>
              {euros(stats.benefices)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Chiffre d'affaires</p>
            <p className="mt-0.5 text-lg font-extrabold text-ink">{euros(stats.ca)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Marge moy.</p>
            <p className="mt-0.5 text-lg font-extrabold text-teal-dark">
              {stats.margePct === null ? '—' : `${stats.margePct} %`}
            </p>
          </div>
          <p className="col-span-3 text-xs text-muted">
            {stats.count} vente{stats.count > 1 ? 's' : ''} au total
          </p>
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
            <Receipt size={30} />
          </span>
          <p className="font-semibold text-ink">Pas encore de vente</p>
          <p className="text-sm text-muted">Ta première marge s'affichera ici.</p>
        </div>
      )}

      {hasSales && (
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
