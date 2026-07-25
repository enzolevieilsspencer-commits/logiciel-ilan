import type { Piece } from './types'

export interface PieceFilters {
  categorie: string | null
  couleur: string | null
  taille: string | null
  marque: string | null
}

export type FilterKey = keyof PieceFilters

export const EMPTY_FILTERS: PieceFilters = {
  categorie: null,
  couleur: null,
  taille: null,
  marque: null,
}

/** Nombre de facettes actives (pour le badge du bouton Filtrer). */
export function activeFilterCount(filters: PieceFilters): number {
  return (Object.values(filters) as (string | null)[]).filter((v) => v !== null).length
}

/** Ne garde que les pièces qui matchent TOUTES les facettes non nulles (ET). */
export function applyFilters(pieces: Piece[], filters: PieceFilters): Piece[] {
  return pieces.filter(
    (p) =>
      (filters.categorie === null || p.categorie === filters.categorie) &&
      (filters.couleur === null || p.couleur === filters.couleur) &&
      (filters.taille === null || p.taille === filters.taille) &&
      (filters.marque === null || p.marque === filters.marque),
  )
}

/** Valeurs distinctes non nulles présentes pour une facette (triées), pour peupler les chips. */
export function distinctValues(pieces: Piece[], key: FilterKey): string[] {
  const set = new Set<string>()
  for (const p of pieces) {
    const value = p[key]
    if (value) set.add(value)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'fr'))
}
