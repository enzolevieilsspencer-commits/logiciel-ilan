import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { PriceRow } from '../../lib/derive'

/**
 * Récupère les lignes de prix des pièces (tous statuts, RLS filtre par utilisateur).
 * Le calcul des indicateurs (avec période) se fait dans le composant, sans refetch.
 */
export function useDashboard() {
  const [rows, setRows] = useState<PriceRow[]>([])
  const [empty, setEmpty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: e } = await supabase
      .from('piece')
      .select('prix_achat_cents, prix_vente_cents, statut, sold_at, categorie, quantite, box_id')
    if (e) {
      setError('Impossible de charger le tableau de bord.')
      setLoading(false)
      return
    }
    const list = (data ?? []) as PriceRow[]
    setEmpty(list.length === 0)
    setRows(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { rows, empty, loading, error, refresh }
}
