import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * Écran de connexion (mono-utilisateur : Ilan).
 * Email + mot de passe via Supabase. Pas d'inscription ni de mot de passe oublié en v1.
 */
export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    // Sur succès, onAuthStateChange bascule l'app vers l'accueil (pas de setState ici).
    if (signInError) {
      setError('Email ou mot de passe incorrect.')
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-app text-ink flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-white shadow-lg p-7 flex flex-col gap-5">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-bold text-teal-dark">Salut ! 👋</h1>
          <p className="text-muted text-sm">Connecte-toi pour retrouver ton stock.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[var(--radius-md)] bg-app px-4 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-teal"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
            Mot de passe
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-[var(--radius-md)] bg-app px-4 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-teal"
            />
          </label>

          {error && <p className="text-sm text-amber font-medium">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-[var(--radius-md)] bg-teal py-3 font-bold text-white shadow-md disabled:opacity-60"
          >
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  )
}
