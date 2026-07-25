import { describe, it, expect } from 'vitest'
import {
  computeMargin,
  computeDashboard,
  isStale,
  daysSince,
  beneficesParMois,
  beneficesSeries,
  repartitionStock,
  type PriceRow,
} from './derive'

describe('computeMargin', () => {
  it('calcule une marge positive (achat 6,00 € → vente 25,00 €)', () => {
    const m = computeMargin(600, 2500)
    expect(m).not.toBeNull()
    expect(m!.margeCents).toBe(1900)
    expect(m!.pct).toBeCloseTo(316.6667, 2)
  })

  it('gère une marge négative (achat 10 € → vente 8 €)', () => {
    const m = computeMargin(1000, 800)
    expect(m!.margeCents).toBe(-200)
    expect(m!.pct).toBe(-20)
  })

  it('renvoie pct = null si prix d’achat = 0 (division impossible)', () => {
    const m = computeMargin(0, 500)
    expect(m!.margeCents).toBe(500)
    expect(m!.pct).toBeNull()
  })

  it('renvoie null si un prix manque', () => {
    expect(computeMargin(null, 500)).toBeNull()
    expect(computeMargin(600, null)).toBeNull()
    expect(computeMargin(null, null)).toBeNull()
  })
})

describe('computeDashboard', () => {
  it('agrège bénéfices, marge moyenne pondérée et argent dormant', () => {
    const pieces: PriceRow[] = [
      { statut: 'vendue', prix_achat_cents: 600, prix_vente_cents: 1000, sold_at: '2026-07-10T00:00:00Z' }, // +400
      { statut: 'vendue', prix_achat_cents: 400, prix_vente_cents: 500, sold_at: '2026-07-12T00:00:00Z' }, //  +100
      { statut: 'en_stock', prix_achat_cents: 800, prix_vente_cents: null, sold_at: null },
      { statut: 'en_stock', prix_achat_cents: 200, prix_vente_cents: null, sold_at: null },
    ]
    const d = computeDashboard(pieces)
    expect(d.beneficesCents).toBe(500) // 400 + 100
    expect(d.argentDormantCents).toBe(1000) // 800 + 200
    expect(d.margeMoyennePct).toBeCloseTo(50, 5) // 500 / (600+400) * 100
  })

  it('marge moyenne = null et bénéfices 0 quand aucune vente', () => {
    const pieces: PriceRow[] = [{ statut: 'en_stock', prix_achat_cents: 500, prix_vente_cents: null, sold_at: null }]
    const d = computeDashboard(pieces)
    expect(d.beneficesCents).toBe(0)
    expect(d.margeMoyennePct).toBeNull()
    expect(d.argentDormantCents).toBe(500)
  })

  it('ignore les vendues avec prix incomplet', () => {
    const pieces: PriceRow[] = [
      { statut: 'vendue', prix_achat_cents: null, prix_vente_cents: 1000, sold_at: '2026-07-10T00:00:00Z' },
    ]
    const d = computeDashboard(pieces)
    expect(d.beneficesCents).toBe(0)
    expect(d.margeMoyennePct).toBeNull()
  })

  it('borne par période : ne compte que les ventes après soldAfter', () => {
    const pieces: PriceRow[] = [
      { statut: 'vendue', prix_achat_cents: 100, prix_vente_cents: 300, sold_at: '2026-06-01T00:00:00Z' }, // avant
      { statut: 'vendue', prix_achat_cents: 200, prix_vente_cents: 500, sold_at: '2026-07-15T00:00:00Z' }, // après
      { statut: 'en_stock', prix_achat_cents: 900, prix_vente_cents: null, sold_at: null },
    ]
    const borne = '2026-07-01T00:00:00Z'
    const d = computeDashboard(pieces, borne)
    expect(d.beneficesCents).toBe(300) // seulement la vente du 15/07
    expect(d.margeMoyennePct).toBeCloseTo(150, 5) // 300 / 200 * 100
    expect(d.argentDormantCents).toBe(900) // non affecté par la borne
  })

  it('soldAfter null = tout (rétro-compatible)', () => {
    const pieces: PriceRow[] = [
      { statut: 'vendue', prix_achat_cents: 100, prix_vente_cents: 300, sold_at: '2020-01-01T00:00:00Z' },
    ]
    expect(computeDashboard(pieces, null).beneficesCents).toBe(200)
  })
})

describe('isStale / daysSince', () => {
  const now = new Date('2026-07-25T00:00:00Z')

  it('une pièce en stock depuis 70 jours stagne', () => {
    const created = new Date('2026-05-16T00:00:00Z').toISOString() // ~70 j avant
    expect(daysSince(created, now)).toBeGreaterThan(60)
    expect(isStale(created, 60, now)).toBe(true)
  })

  it('une pièce récente (10 jours) ne stagne pas', () => {
    const created = new Date('2026-07-15T00:00:00Z').toISOString()
    expect(isStale(created, 60, now)).toBe(false)
  })

  it('au seuil exact, non stagnante (strictement supérieur)', () => {
    const created = new Date('2026-05-26T00:00:00Z').toISOString() // exactement 60 j
    expect(isStale(created, 60, now)).toBe(false)
  })
})

describe('beneficesParMois', () => {
  const now = new Date('2026-07-15T12:00:00Z')

  it('ventile les marges des vendues par mois (n derniers mois)', () => {
    const pieces: PriceRow[] = [
      { statut: 'vendue', prix_achat_cents: 600, prix_vente_cents: 1000, sold_at: '2026-07-05T00:00:00Z' }, // juil +400
      { statut: 'vendue', prix_achat_cents: 200, prix_vente_cents: 500, sold_at: '2026-07-20T00:00:00Z' }, //  juil +300
      { statut: 'vendue', prix_achat_cents: 100, prix_vente_cents: 400, sold_at: '2026-06-10T00:00:00Z' }, //  juin +300
      { statut: 'en_stock', prix_achat_cents: 900, prix_vente_cents: null, sold_at: null }, // ignoré
    ]
    const res = beneficesParMois(pieces, 6, now)
    expect(res).toHaveLength(6)
    expect(res[res.length - 1].beneficesCents).toBe(700) // juillet
    expect(res[res.length - 2].beneficesCents).toBe(300) // juin
    expect(res[0].beneficesCents).toBe(0) // février, rien
  })
})

describe('beneficesSeries', () => {
  const now = new Date('2026-07-15T12:00:00Z')

  it('regroupe par jour sur les N derniers jours', () => {
    const pieces: PriceRow[] = [
      { statut: 'vendue', prix_achat_cents: 100, prix_vente_cents: 600, sold_at: '2026-07-15T09:00:00Z', categorie: null }, // aujourd'hui : +500
      { statut: 'vendue', prix_achat_cents: 100, prix_vente_cents: 400, sold_at: '2026-07-13T09:00:00Z', categorie: null }, // il y a 2j : +300
      { statut: 'vendue', prix_achat_cents: 100, prix_vente_cents: 300, sold_at: '2026-06-01T09:00:00Z', categorie: null }, // hors fenêtre
    ]
    const res = beneficesSeries(pieces, 'day', 7, now)
    expect(res).toHaveLength(7)
    expect(res[res.length - 1].beneficesCents).toBe(500) // aujourd'hui
    expect(res[res.length - 3].beneficesCents).toBe(300) // il y a 2 jours
    expect(res[0].beneficesCents).toBe(0)
  })

  it('regroupe par mois (le plus ancien en premier)', () => {
    const pieces: PriceRow[] = [
      { statut: 'vendue', prix_achat_cents: 100, prix_vente_cents: 900, sold_at: '2026-07-10T00:00:00Z', categorie: null }, // +800
      { statut: 'en_stock', prix_achat_cents: 500, prix_vente_cents: null, sold_at: null, categorie: null }, // ignoré
    ]
    const res = beneficesSeries(pieces, 'month', 6, now)
    expect(res).toHaveLength(6)
    expect(res[res.length - 1].beneficesCents).toBe(800)
    expect(res[0].beneficesCents).toBe(0)
  })
})

describe('repartitionStock', () => {
  it('compte les pièces en stock par catégorie, décroissant', () => {
    const pieces: PriceRow[] = [
      { statut: 'en_stock', prix_achat_cents: 1, prix_vente_cents: null, sold_at: null, categorie: 'Jean' },
      { statut: 'en_stock', prix_achat_cents: 1, prix_vente_cents: null, sold_at: null, categorie: 'Jean' },
      { statut: 'en_stock', prix_achat_cents: 1, prix_vente_cents: null, sold_at: null, categorie: 'Pull' },
      { statut: 'vendue', prix_achat_cents: 1, prix_vente_cents: 2, sold_at: '2026-07-01T00:00:00Z', categorie: 'Jean' },
    ]
    const res = repartitionStock(pieces)
    expect(res[0]).toEqual({ categorie: 'Jean', count: 2 })
    expect(res[1]).toEqual({ categorie: 'Pull', count: 1 })
    expect(res).toHaveLength(2)
  })
})
