import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Indicateur de santé TEMPORAIRE (Story 1.2) : confirme que Supabase est joignable.
// À retirer quand l'écran d'authentification arrive (Story 1.3).
type Health = 'checking' | 'ok' | 'error'

function App() {
  const [health, setHealth] = useState<Health>('checking')

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ error }) => setHealth(error ? 'error' : 'ok'))
      .catch(() => setHealth('error'))
  }, [])

  const label =
    health === 'checking'
      ? 'Vérification…'
      : health === 'ok'
        ? 'Supabase : connecté ✓'
        : 'Supabase : hors ligne ✗'
  const color =
    health === 'ok' ? 'text-green' : health === 'error' ? 'text-amber' : 'text-muted'

  return (
    <main className="min-h-screen bg-app text-ink flex flex-col items-center justify-center gap-2 p-6">
      <h1 className="text-2xl font-bold text-teal-dark">Ilan · Stock &amp; Marge</h1>
      <p className="text-muted">Le socle est prêt. 👕📊</p>
      <p className={`text-sm font-semibold ${color}`}>{label}</p>
    </main>
  )
}

export default App
