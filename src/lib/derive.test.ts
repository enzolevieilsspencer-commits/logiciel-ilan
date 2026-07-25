import { describe, it, expect } from 'vitest'
import { computeMargin } from './derive'

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
