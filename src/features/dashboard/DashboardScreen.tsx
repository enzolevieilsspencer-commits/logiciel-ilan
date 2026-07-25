import { useState } from 'react'
import {
  TrendingUp,
  PiggyBank,
  Package,
  ShoppingBag,
  Plus,
  ArrowUpRight,
  BarChart3,
  Layers,
  type LucideIcon,
} from 'lucide-react'
import {
  computeDashboard,
  beneficesParMois,
  repartitionStock,
  type PriceRow,
  type MonthBucket,
  type CategorieCount,
} from '../../lib/derive'

type Period = 'mois' | 'annee' | 'total'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'mois', label: 'Ce mois' },
  { key: 'annee', label: 'Cette année' },
  { key: 'total', label: 'Depuis le début' },
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

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  valueClass?: string
}

function StatCard({ label, value, sub, icon: Icon, valueClass }: StatCardProps) {
  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-app text-teal-dark">
          <Icon size={18} />
        </span>
      </div>
      <p className={`mt-3 text-3xl font-extrabold ${valueClass ?? 'text-ink'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  )
}

/** Courbe lissée (Catmull-Rom → bézier) reliant une série de points. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

function BenefitsLineChart({ data }: { data: MonthBucket[] }) {
  const W = 100
  const H = 40
  const values = data.map((d) => Math.max(d.beneficesCents, 0))
  const max = Math.max(1, ...values)
  const n = data.length
  const points = values.map((v, i) => ({
    x: n === 1 ? W / 2 : (i / (n - 1)) * W,
    y: H - 3 - (v / max) * (H - 6),
  }))
  const line = smoothPath(points)
  const area = line ? `${line} L ${points[n - 1].x} ${H} L ${points[0].x} ${H} Z` : ''

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-40 w-full overflow-visible">
        <defs>
          <linearGradient id="benefFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#09b1ba" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#09b1ba" stopOpacity="0" />
          </linearGradient>
        </defs>
        {area && <path d={area} fill="url(#benefFill)" />}
        <path
          d={line}
          fill="none"
          stroke="#09b1ba"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-1.5 flex gap-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-xs capitalize text-muted">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function CategoryBars({ data }: { data: CategorieCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  if (data.length === 0) return <p className="text-sm text-muted">Rien en stock pour l'instant.</p>
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d) => (
        <div key={d.categorie} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-sm text-muted">{d.categorie}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-app">
            <div className="h-full rounded-full bg-teal" style={{ width: `${(d.count / max) * 100}%` }} />
          </div>
          <span className="w-5 text-right text-sm font-semibold text-ink">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

interface DashboardScreenProps {
  rows: PriceRow[]
  empty: boolean
  loading: boolean
  error: string | null
  onAdd: () => void
}

export function DashboardScreen({ rows, empty, loading, error, onAdd }: DashboardScreenProps) {
  const [period, setPeriod] = useState<Period>('total')
  const data = computeDashboard(rows, boundaryISO(period))
  const nbEnStock = rows.filter((r) => r.statut === 'en_stock').length
  const nbVendues = rows.filter((r) => r.statut === 'vendue').length
  const parMois = beneficesParMois(rows)
  const repartition = repartitionStock(rows)

  return (
    <div className="mx-auto w-full max-w-5xl p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink md:text-3xl">Tableau de bord</h1>
          <p className="text-sm text-muted">Voilà où en est ton business aujourd'hui.</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="hidden items-center gap-2 rounded-[var(--radius-md)] bg-teal px-4 py-2.5 font-semibold text-white shadow-md md:flex"
        >
          <Plus size={18} /> Ajouter une pièce
        </button>
      </div>

      {loading && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[var(--radius-card)] bg-surface/70" />
          ))}
        </div>
      )}

      {!loading && error && <p className="mt-6 text-sm text-amber">{error}</p>}

      {!loading && !error && empty && (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-[var(--radius-card)] bg-surface p-10 text-center shadow-sm">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-app text-teal">
            <Package size={30} />
          </span>
          <div>
            <p className="text-lg font-bold text-ink">Ton tableau de bord t'attend</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              Ajoute ta première pièce pour voir tes bénéfices, ta marge moyenne et l'argent qui dort dans ton stock.
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 rounded-[var(--radius-md)] bg-teal px-5 py-3 font-semibold text-white shadow-md"
          >
            <Plus size={18} /> Ajouter ma première pièce
          </button>
        </div>
      )}

      {!loading && !error && !empty && (
        <>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {PERIODS.map((p) => {
              const active = p.key === period
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  aria-pressed={active}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                    active ? 'bg-teal text-white' : 'bg-surface text-muted shadow-sm'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Bénéfices — carte héro */}
            <div className="rounded-[var(--radius-card)] bg-gradient-to-br from-teal to-teal-dark p-5 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium opacity-90">Bénéfices</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/20">
                  <TrendingUp size={18} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold">{euros(data.beneficesCents)}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs opacity-90">
                <ArrowUpRight size={14} />
                Marge moyenne {data.margeMoyennePct === null ? '—' : `${Math.round(data.margeMoyennePct)} %`}
              </p>
            </div>

            <StatCard
              label="Argent qui dort"
              value={euros(data.argentDormantCents)}
              sub="Capital en stock"
              icon={PiggyBank}
              valueClass="text-amber"
            />
            <StatCard label="Pièces en stock" value={String(nbEnStock)} sub="à vendre" icon={Package} />
            <StatCard label="Ventes" value={String(nbVendues)} sub="au total" icon={ShoppingBag} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 size={18} className="text-teal-dark" />
                <h2 className="font-bold text-ink">Bénéfices par mois</h2>
                <span className="ml-auto text-xs text-muted">6 derniers mois · €</span>
              </div>
              <BenefitsLineChart data={parMois} />
            </div>

            <div className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Layers size={18} className="text-teal-dark" />
                <h2 className="font-bold text-ink">Répartition du stock</h2>
                <span className="ml-auto text-xs text-muted">par catégorie</span>
              </div>
              <CategoryBars data={repartition} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
