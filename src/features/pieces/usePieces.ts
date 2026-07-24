import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Piece } from './types'

/**
 * Charge les pièces *en stock* (RLS filtre déjà par utilisateur) et génère
 * les URLs signées (bucket privé) pour leurs photos, en batch.
 */
export function usePieces() {
  const [pieces, setPieces] = useState<Piece[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: e } = await supabase
      .from('piece')
      .select('*')
      .eq('statut', 'en_stock')
      .order('created_at', { ascending: false })

    if (e) {
      setError('Impossible de charger le stock.')
      setLoading(false)
      return
    }

    const list = (data ?? []) as Piece[]
    setPieces(list)

    const paths = list.map((p) => p.photo_path).filter((x): x is string => !!x)
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage.from('piece-photos').createSignedUrls(paths, 3600)
      const map: Record<string, string> = {}
      signed?.forEach((s) => {
        if (s.path && s.signedUrl) map[s.path] = s.signedUrl
      })
      setUrls(map)
    } else {
      setUrls({})
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { pieces, urls, loading, error, refresh }
}
