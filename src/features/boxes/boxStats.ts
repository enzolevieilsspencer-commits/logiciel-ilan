import type { Piece } from '../pieces/types'
import type { Box } from './types'

export interface BoxStats {
  /** Articles rattachés (lignes). */
  articles: number
  /** Unités totales (Σ quantité). */
  units: number
  /** Unités déjà vendues. */
  soldUnits: number
  /** Revenu réalisé (Σ des ventes : quantité × prix de vente). */
  revenueCents: number
  /** Prix payé pour le lot. */
  costCents: number
  /** Marge de la box = revenu réalisé − prix du lot (peut être négatif tant que non amorti). */
  margeCents: number
  /** Coût unitaire réparti du lot (prix du lot ÷ unités totales). */
  unitCostCents: number
  /** Vrai quand toutes les unités sont vendues. */
  fullySold: boolean
}

/** Agrège les indicateurs d'une box à partir des pièces (tous statuts). DÉRIVÉ. */
export function computeBoxStats(box: Box, pieces: Piece[]): BoxStats {
  const inBox = pieces.filter((p) => p.box_id === box.id)
  let units = 0
  let soldUnits = 0
  let revenue = 0
  for (const p of inBox) {
    const q = p.quantite ?? 1
    units += q
    if (p.statut === 'vendue') {
      soldUnits += q
      if (p.prix_vente_cents != null) revenue += p.prix_vente_cents * q
    }
  }
  const cost = box.prix_achat_cents ?? 0
  return {
    articles: inBox.length,
    units,
    soldUnits,
    revenueCents: revenue,
    costCents: cost,
    margeCents: revenue - cost,
    unitCostCents: units > 0 && box.prix_achat_cents != null ? box.prix_achat_cents / units : 0,
    fullySold: units > 0 && soldUnits === units,
  }
}
