import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Box } from './types'

/** Charge les boxes de l'utilisateur (RLS), les plus récentes d'abord. */
export function useBoxes() {
  const [boxes, setBoxes] = useState<Box[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: e } = await supabase
      .from('box')
      .select('*')
      .order('created_at', { ascending: false })
    if (e) {
      setError('Impossible de charger les box.')
      setLoading(false)
      return
    }
    setBoxes((data ?? []) as Box[])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { boxes, loading, error, refresh }
}
