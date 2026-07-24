import { useSession } from '../features/auth/useSession'
import { LoginScreen } from '../features/auth/LoginScreen'
import { AppShell } from './AppShell'

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

  return <AppShell />
}

export default App
