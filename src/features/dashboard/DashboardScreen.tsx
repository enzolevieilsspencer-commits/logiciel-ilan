import { useState } from 'react'
import { computeDashboard, type PriceRow } from '../../lib/derive'

type Period = 'mois' | 'annee' | 'total'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'mois', label: 'Mois' },
  { key: 'annee', label: 'Année' },
  { key: 'total', label: 'Total' },
]

function boundaryISO(period: Period): string | null {
  const now = new Date()
  if (period === 'mois') return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  if (period === 'annee') return new Date(now.getFullYear(), 0, 1).toISOString()
  return null
}

function euros(cents: number): string {
  const abs = (Math.abs(cents) / 100).toFixed(2).replace('.', ',')
  return `${cents < 0 ? '−' : ''}${abs} €`
}

interface DashboardScreenProps {
  rows: PriceRow[]
  empty: boolean
  loading: boolean
  error: string | null
}

export function DashboardScreen({ rows, empty, loading, error }: DashboardScreenProps) {
  const [period, setPeriod] = useState<Period>('total')
  const data = computeDashboard(rows, boundaryISO(period))

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pt-8">
      <h1 className="px-1 text-2xl font-bold text-teal-dark">Salut Ilan 👋</h1>

      {loading && (
        <>
          <div className="h-32 animate-pulse rounded-[var(--radius-card)] bg-white/70" />
          <div className="h-20 animate-pulse rounded-[var(--radius-card)] bg-white/70" />
        </>
      )}

      {!loading && error && <p className="px-1 text-sm text-amber">{error}</p>}

      {!loading && !error && empty && (
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <span className="text-4xl">📊</span>
          <p className="font-semibold text-ink">Ton tableau de bord t'attend</p>
          <p className="text-sm text-muted">Ajoute ta première pièce avec le bouton ＋.</p>
        </div>
      )}

      {!loading && !error && !empty && (
        <>
          {/* Carte héro : Bénéfices + Marge moyenne + sélecteur de période */}
          <div className="rounded-[var(--radius-card)] bg-gradient-to-br from-teal to-teal-dark p-5 text-white shadow-lg">
            <div className="flex flex-wrap gap-1.5">
              {PERIODS.map((p) => {
                const active = p.key === period
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPeriod(p.key)}
                    aria-pressed={active}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      active ? 'bg-white text-teal-dark' : 'bg-white/20 text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm opacity-85">Bénéfices</p>
                <p className="text-3xl font-extrabold">{euros(data.beneficesCents)}</p>
              </div>
              <p className="text-right text-sm">
                <span className="block opacity-85">Marge moyenne</span>
                <span className="text-lg font-bold">
                  {data.margeMoyennePct === null ? '—' : `${Math.round(data.margeMoyennePct)} %`}
                </span>
              </p>
            </div>
          </div>

          {/* Argent dormant (non affecté par la période) */}
          <div className="rounded-[var(--radius-card)] bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">😴 Argent qui dort en stock</p>
            <p className="mt-1 text-2xl font-extrabold text-amber">{euros(data.argentDormantCents)}</p>
          </div>
        </>
      )}
    </div>
  )
}
