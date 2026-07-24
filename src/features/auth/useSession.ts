import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

/**
 * État d'authentification de l'app.
 * - `loading` : vrai le temps de lire la session au démarrage.
 * - `session` : null = déconnecté ; sinon la session Supabase courante.
 * La persistance et le rafraîchissement du token sont gérés par supabase-js.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}
