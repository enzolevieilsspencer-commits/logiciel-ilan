import { describe, it, expect } from 'vitest'
import { computeMargin, computeDashboard, type PriceRow } from './derive'

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
      { statut: 'vendue', prix_achat_cents: 600, prix_vente_cents: 1000 }, // marge +400
      { statut: 'vendue', prix_achat_cents: 400, prix_vente_cents: 500 }, //  marge +100
      { statut: 'en_stock', prix_achat_cents: 800, prix_vente_cents: null },
      { statut: 'en_stock', prix_achat_cents: 200, prix_vente_cents: null },
    ]
    const d = computeDashboard(pieces)
    expect(d.beneficesCents).toBe(500) // 400 + 100
    expect(d.argentDormantCents).toBe(1000) // 800 + 200
    // pondérée : 500 / (600+400) * 100 = 50 %
    expect(d.margeMoyennePct).toBeCloseTo(50, 5)
  })

  it('marge moyenne = null et bénéfices 0 quand aucune vente', () => {
    const pieces: PriceRow[] = [{ statut: 'en_stock', prix_achat_cents: 500, prix_vente_cents: null }]
    const d = computeDashboard(pieces)
    expect(d.beneficesCents).toBe(0)
    expect(d.margeMoyennePct).toBeNull()
    expect(d.argentDormantCents).toBe(500)
  })

  it('ignore les vendues avec prix incomplet', () => {
    const pieces: PriceRow[] = [{ statut: 'vendue', prix_achat_cents: null, prix_vente_cents: 1000 }]
    const d = computeDashboard(pieces)
    expect(d.beneficesCents).toBe(0)
    expect(d.margeMoyennePct).toBeNull()
  })
})
