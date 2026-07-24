import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSession } from '../features/auth/useSession'
import { LoginScreen } from '../features/auth/LoginScreen'
import { AddPieceScreen } from '../features/pieces/AddPieceScreen'

type View = 'home' | 'add'

// Accueil temporaire (Story 2.1) : compteur du stock + entrée d'ajout.
// La vraie liste, le FAB et la tabbar arrivent en Story 2.2.
function AuthenticatedApp() {
  const [view, setView] = useState<View>('home')
  const [count, setCount] = useState<number | null>(null)

  const refreshCount = useCallback(async () => {
    const { count: c } = await supabase
      .from('piece')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'en_stock')
    setCount(c ?? 0)
  }, [])

  useEffect(() => {
    refreshCount()
  }, [refreshCount])

  if (view === 'add') {
    return (
      <AddPieceScreen
        onCancel={() => setView('home')}
        onAdded={() => {
          setView('home')
          refreshCount()
        }}
      />
    )
  }

  return (
    <main className="min-h-screen bg-app text-ink flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold text-teal-dark">Ilan · Stock &amp; Marge</h1>
      <p className="text-muted">
        {count === null ? '…' : `${count} pièce${count > 1 ? 's' : ''} en stock`}
      </p>
      <button
        type="button"
        onClick={() => setView('add')}
        className="rounded-[var(--radius-md)] bg-teal px-5 py-3 font-bold text-white shadow-md"
      >
        ＋ Ajouter une pièce
      </button>
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

function App() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <main className="min-h-screen bg-app flex items-center justify-center">
        <p className="text-muted text-sm">Chargement…</p>
      </main>
    )
  }

  if (!session) {
    return <LoginScreen />
  }

  return <AuthenticatedApp />
}

export default App
