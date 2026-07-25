import type { DashboardData } from '../../lib/derive'

interface DashboardScreenProps {
  data: DashboardData | null
  empty: boolean
  loading: boolean
  error: string | null
}

function euros(cents: number): string {
  const abs = (Math.abs(cents) / 100).toFixed(2).replace('.', ',')
  return `${cents < 0 ? '−' : ''}${abs} €`
}

export function DashboardScreen({ data, empty, loading, error }: DashboardScreenProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pt-8">
      <h1 className="px-1 text-2xl font-bold text-teal-dark">Salut Ilan 👋</h1>

      {loading && (
        <>
          <div className="h-28 animate-pulse rounded-[var(--radius-card)] bg-white/70" />
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

      {!loading && !error && !empty && data && (
        <>
          {/* Carte héro : Bénéfices + Marge moyenne accolée */}
          <div className="rounded-[var(--radius-card)] bg-gradient-to-br from-teal to-teal-dark p-5 text-white shadow-lg">
            <p className="text-sm opacity-85">Bénéfices</p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <p className="text-3xl font-extrabold">{euros(data.beneficesCents)}</p>
              <p className="text-right text-sm">
                <span className="block opacity-85">Marge moyenne</span>
                <span className="text-lg font-bold">
                  {data.margeMoyennePct === null ? '—' : `${Math.round(data.margeMoyennePct)} %`}
                </span>
              </p>
            </div>
          </div>

          {/* Argent dormant */}
          <div className="rounded-[var(--radius-card)] bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">😴 Argent qui dort en stock</p>
            <p className="mt-1 text-2xl font-extrabold text-amber">{euros(data.argentDormantCents)}</p>
          </div>
        </>
      )}
    </div>
  )
}
