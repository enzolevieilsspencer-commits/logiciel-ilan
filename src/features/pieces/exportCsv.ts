import { computeMargin } from '../../lib/derive'
import type { Piece } from './types'

function euro(cents: number | null): string {
  if (cents == null) return ''
  return (cents / 100).toFixed(2).replace('.', ',')
}

function dateFR(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('fr-FR') : ''
}

/** Échappe une cellule CSV (délimiteur « ; », standard Excel FR). */
function cell(value: string): string {
  return /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** Construit un CSV (séparateur « ; ») à partir d'une liste de pièces. */
export function piecesToCsv(pieces: Piece[]): string {
  const headers = [
    'Catégorie',
    'Couleur',
    'Taille',
    'Marque',
    'Quantité',
    'Prix achat (€)',
    'Prix vente (€)',
    'Marge (€)',
    'Marge (%)',
    'Date de vente',
    'Date d’ajout',
  ]
  const lines = pieces.map((p) => {
    const m = computeMargin(p.prix_achat_cents, p.prix_vente_cents)
    return [
      p.categorie ?? '',
      p.couleur ?? '',
      p.taille ?? '',
      p.marque ?? '',
      String(p.quantite ?? 1),
      euro(p.prix_achat_cents),
      euro(p.prix_vente_cents),
      m ? euro(m.margeCents) : '',
      m && m.pct !== null ? String(Math.round(m.pct)) : '',
      dateFR(p.sold_at),
      dateFR(p.created_at),
    ]
      .map((v) => cell(String(v)))
      .join(';')
  })
  return [headers.map(cell).join(';'), ...lines].join('\r\n')
}

/** Déclenche le téléchargement d'un CSV (BOM UTF-8 pour les accents dans Excel). */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
