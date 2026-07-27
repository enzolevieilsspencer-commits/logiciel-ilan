import { useSession } from '../features/auth/useSession'
import { LoginScreen } from '../features/auth/LoginScreen'
import { ResetPasswordScreen } from '../features/auth/ResetPasswordScreen'
import { AppShell } from './AppShell'
import { Splash } from '../components/ui/Splash'
import { ConfigErrorScreen } from './ConfigErrorScreen'
import { supabaseConfigMissing } from '../lib/supabase'

function App() {
  const { session, loading, recovery, endRecovery } = useSession()

  // Config Supabase absente : écran d'erreur lisible plutôt qu'une page blanche.
  if (supabaseConfigMissing) {
    return <ConfigErrorScreen />
  }

  let content
  if (recovery) {
    // Lien de réinitialisation : on force la définition d'un nouveau mot de passe.
    content = <ResetPasswordScreen onDone={endRecovery} />
  } else if (loading) {
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
