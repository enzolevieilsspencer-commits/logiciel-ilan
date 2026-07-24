import { supabase } from '../lib/supabase'
import { useSession } from '../features/auth/useSession'
import { LoginScreen } from '../features/auth/LoginScreen'

function App() {
  const { session, loading } = useSession()

  // Écran d'attente sobre le temps de lire la session au démarrage.
  if (loading) {
    return (
      <main className="min-h-screen bg-app flex items-center justify-center">
        <p className="text-muted text-sm">Chargement…</p>
      </main>
    )
  }

  // Garde d'accès : rien n'est accessible sans session valide.
  if (!session) {
    return <LoginScreen />
  }

  // Accueil (placeholder — les vraies surfaces arrivent en Epic 2).
  // Le bouton de déconnexion est temporaire ici ; il migrera dans l'onglet Réglages.
  return (
    <main className="min-h-screen bg-app text-ink flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold text-teal-dark">Ilan · Stock &amp; Marge</h1>
      <p className="text-muted">Connecté. 👕📊</p>
      <button
        type="button"
        onClick={() => supabase.auth.signOut()}
        className="rounded-[var(--radius-md)] bg-white px-4 py-2 text-sm font-semibold text-teal-dark shadow"
      >
        Se déconnecter
      </button>
    </main>
  )
}

export default App
