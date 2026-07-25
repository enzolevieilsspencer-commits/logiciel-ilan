import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { computeDashboard, type DashboardData, type PriceRow } from '../../lib/derive'

/**
 * Récupère les pièces (tous statuts, RLS filtre par utilisateur) et calcule
 * les indicateurs du tableau de bord (dérivés, jamais stockés — AD-2).
 */
export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [empty, setEmpty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data: rows, error: e } = await supabase
      .from('piece')
      .select('prix_achat_cents, prix_vente_cents, statut')
    if (e) {
      setError('Impossible de charger le tableau de bord.')
      setLoading(false)
      return
    }
    const list = (rows ?? []) as PriceRow[]
    setEmpty(list.length === 0)
    setData(computeDashboard(list))
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, empty, loading, error, refresh }
}
