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
