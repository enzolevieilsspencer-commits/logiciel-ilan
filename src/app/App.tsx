import { useSession } from '../features/auth/useSession'
import { LoginScreen } from '../features/auth/LoginScreen'
import { AppShell } from './AppShell'
import { Splash } from '../components/ui/Splash'
import { ConfigErrorScreen } from './ConfigErrorScreen'
import { supabaseConfigMissing } from '../lib/supabase'

function App() {
  const { session, loading } = useSession()

  // Config Supabase absente : écran d'erreur lisible plutôt qu'une page blanche.
  if (supabaseConfigMissing) {
    return <ConfigErrorScreen />
  }

  let content
  if (loading) {
    content = (
      <main className="min-h-screen bg-app flex items-center justify-center">
        <p className="text-muted text-sm">Chargement…</p>
      </main>
    )
  } else if (!session) {
    content = <LoginScreen />
  } else {
    content = <AppShell />
  }

  return (
    <>
      {content}
      <Splash />
    </>
  )
}

export default App
