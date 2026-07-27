export type Statut = 'en_stock' | 'vendue'

export interface Piece {
  id: string
  user_id: string
  photo_path: string | null
  categorie: string | null
  couleur: string | null
  taille: string | null
  marque: string | null
  prix_achat_cents: number | null
  prix_vente_cents: number | null
  statut: Statut
  created_at: string
  sold_at: string | null
}

// Listes fermées « style Vinted » (catégorie & couleur en chips mono-choix).
export const CATEGORIES = [
  'T-shirt', 'Chemise', 'Pull', 'Sweat', 'Veste', 'Manteau',
  'Pantalon', 'Jean', 'Short', 'Jupe', 'Robe', 'Chaussures', 'Sac', 'Accessoire',
] as const

export const COULEURS = [
  'Noir', 'Blanc', 'Gris', 'Beige', 'Marron', 'Rouge', 'Rose',
  'Orange', 'Jaune', 'Vert', 'Bleu', 'Violet', 'Multicolore',
] as const

/** Parse une saisie en euros (« 6 », « 6,50 », « 6.5 ») vers des centimes entiers. */
export function eurosToCents(input: string): number | null {
  const normalized = input.trim().replace(',', '.')
  if (normalized === '') return null
  const euros = Number(normalized)
  if (!Number.isFinite(euros) || euros < 0) return null
  return Math.round(euros * 100)
}

/** Formate des centimes en chaîne euros (ex. 650 → « 6,50 »). */
export function centsToEuros(cents: number | null): string {
  if (cents == null) return ''
  return (cents / 100).toFixed(2).replace('.', ',')
}

/** ISO (ou null) → valeur d'un <input type="date"> « YYYY-MM-DD » (défaut : aujourd'hui). */
export function isoToDateInput(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Valeur d'un <input type="date"> « YYYY-MM-DD » → ISO (midi local, évite le décalage de fuseau). */
export function dateInputToISO(value: string): string {
  return new Date(`${value}T12:00:00`).toISOString()
}
