export interface Margin {
  /** Marge en centimes : prix de vente − prix d'achat. */
  margeCents: number
  /** Marge en % (null si prix d'achat <= 0, division impossible). */
  pct: number | null
}

/**
 * Marge dérivée d'une pièce, à partir des prix en centimes.
 * Renvoie `null` si l'un des deux prix est absent.
 * DÉRIVÉE — jamais stockée en base (AD-2).
 */
export function computeMargin(
  prixAchatCents: number | null,
  prixVenteCents: number | null,
): Margin | null {
  if (prixAchatCents == null || prixVenteCents == null) return null
  const margeCents = prixVenteCents - prixAchatCents
  const pct = prixAchatCents > 0 ? (margeCents / prixAchatCents) * 100 : null
  return { margeCents, pct }
}

/** Ligne minimale nécessaire au dashboard (type structural local — `lib` ne dépend pas de `features`). */
export interface PriceRow {
  statut: string
  prix_achat_cents: number | null
  prix_vente_cents: number | null
  sold_at: string | null
  categorie?: string | null
}

export interface DashboardData {
  /** Σ (prix_vente − prix_achat) des pièces vendues. */
  beneficesCents: number
  /** Marge moyenne PONDÉRÉE : Σ marge € ÷ Σ prix d'achat (vendues) × 100 ; null si aucune base. */
  margeMoyennePct: number | null
  /** Σ prix d'achat des pièces en stock (capital immobilisé). */
  argentDormantCents: number
}

/**
 * Agrège les indicateurs du tableau de bord. DÉRIVÉ, jamais stocké (AD-2).
 * `soldAfterISO` (optionnel) borne les VENTES prises en compte pour bénéfices & marge moyenne
 * (une vente compte si `sold_at >= soldAfterISO`) ; l'argent dormant n'est jamais borné.
 */
export function computeDashboard(pieces: PriceRow[], soldAfterISO: string | null = null): DashboardData {
  let beneficesCents = 0
  let sommeAchatVendues = 0
  let argentDormantCents = 0

  for (const p of pieces) {
    if (p.statut === 'vendue' && p.prix_achat_cents != null && p.prix_vente_cents != null) {
      const dansPeriode = p.sold_at != null && (soldAfterISO === null || p.sold_at >= soldAfterISO)
      if (dansPeriode) {
        beneficesCents += p.prix_vente_cents - p.prix_achat_cents
        sommeAchatVendues += p.prix_achat_cents
      }
    } else if (p.statut === 'en_stock' && p.prix_achat_cents != null) {
      argentDormantCents += p.prix_achat_cents
    }
  }

  const margeMoyennePct = sommeAchatVendues > 0 ? (beneficesCents / sommeAchatVendues) * 100 : null
  return { beneficesCents, margeMoyennePct, argentDormantCents }
}

/** Seuil de stagnation (jours) — non configurable en v1. */
export const STALE_THRESHOLD_DAYS = 60

/** Jours écoulés depuis une date ISO. */
export function daysSince(iso: string, now: Date = new Date()): number {
  return (now.getTime() - new Date(iso).getTime()) / 86_400_000
}

/** Vrai si une pièce en stock stagne (créée il y a strictement plus que le seuil). */
export function isStale(
  createdAtISO: string,
  thresholdDays: number = STALE_THRESHOLD_DAYS,
  now: Date = new Date(),
): boolean {
  return daysSince(createdAtISO, now) > thresholdDays
}

export interface MonthBucket {
  label: string // ex. « juil. »
  beneficesCents: number
}

/** Bénéfices (Σ marge €) par mois sur les `n` derniers mois (le plus ancien d'abord). */
export function beneficesParMois(pieces: PriceRow[], n = 6, now: Date = new Date()): MonthBucket[] {
  const buckets: (MonthBucket & { y: number; m: number })[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      y: d.getFullYear(),
      m: d.getMonth(),
      label: d.toLocaleDateString('fr-FR', { month: 'short' }),
      beneficesCents: 0,
    })
  }
  for (const p of pieces) {
    if (p.statut === 'vendue' && p.prix_achat_cents != null && p.prix_vente_cents != null && p.sold_at) {
      const d = new Date(p.sold_at)
      const b = buckets.find((x) => x.y === d.getFullYear() && x.m === d.getMonth())
      if (b) b.beneficesCents += p.prix_vente_cents - p.prix_achat_cents
    }
  }
  return buckets.map(({ label, beneficesCents }) => ({ label, beneficesCents }))
}

export type Timeframe = 'day' | 'week' | 'month'

function bucketStart(unit: Timeframe, d: Date): Date {
  if (unit === 'day') return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  if (unit === 'month') return new Date(d.getFullYear(), d.getMonth(), 1)
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = (x.getDay() + 6) % 7 // lundi = 0
  x.setDate(x.getDate() - dow)
  return x
}

function addUnits(unit: Timeframe, d: Date, k: number): Date {
  const x = new Date(d)
  if (unit === 'day') x.setDate(x.getDate() + k)
  else if (unit === 'week') x.setDate(x.getDate() + 7 * k)
  else x.setMonth(x.getMonth() + k)
  return x
}

function bucketLabel(unit: Timeframe, d: Date): string {
  if (unit === 'month') return d.toLocaleDateString('fr-FR', { month: 'short' })
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

/** Bénéfices (Σ marge €) par bucket (jour/semaine/mois), sur `count` derniers buckets. */
export function beneficesSeries(
  pieces: PriceRow[],
  unit: Timeframe,
  count: number,
  now: Date = new Date(),
): MonthBucket[] {
  const cur = bucketStart(unit, now)
  const buckets: (MonthBucket & { start: number; end: number })[] = []
  for (let i = count - 1; i >= 0; i--) {
    const start = addUnits(unit, cur, -i)
    const end = addUnits(unit, start, 1)
    buckets.push({ start: start.getTime(), end: end.getTime(), label: bucketLabel(unit, start), beneficesCents: 0 })
  }
  for (const p of pieces) {
    if (p.statut === 'vendue' && p.prix_achat_cents != null && p.prix_vente_cents != null && p.sold_at) {
      const t = new Date(p.sold_at).getTime()
      const b = buckets.find((x) => t >= x.start && t < x.end)
      if (b) b.beneficesCents += p.prix_vente_cents - p.prix_achat_cents
    }
  }
  return buckets.map(({ label, beneficesCents }) => ({ label, beneficesCents }))
}

export interface CategorieCount {
  categorie: string
  count: number
}

/** Répartition des pièces EN STOCK par catégorie (décroissant). */
export function repartitionStock(pieces: PriceRow[]): CategorieCount[] {
  const map = new Map<string, number>()
  for (const p of pieces) {
    if (p.statut === 'en_stock' && p.categorie) {
      map.set(p.categorie, (map.get(p.categorie) ?? 0) + 1)
    }
  }
  return [...map.entries()]
    .map(([categorie, count]) => ({ categorie, count }))
    .sort((a, b) => b.count - a.count)
}
