import { useState, type FormEvent } from 'react'
import { Mail, Lock, LogIn } from 'lucide-react'
import { supabase } from '../../lib/supabase'

/**
 * Écran de connexion (un seul compte en v1).
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
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    // Sur succès, onAuthStateChange bascule l'app vers l'accueil (pas de setState ici).
    if (signInError) {
      setError('Email ou mot de passe incorrect.')
      setSubmitting(false)
    }
  }

  const fieldClass =
    'w-full rounded-[var(--radius-md)] bg-app py-3 pl-11 pr-4 text-base text-ink outline-none focus:ring-2 focus:ring-teal'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-app p-6 text-ink">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-[var(--radius-card)] bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/pwa-192x192.png" alt="" className="h-16 w-16 rounded-2xl shadow-md" />
          <div>
            <h1 className="text-xl font-bold text-teal-dark">Vendly</h1>
            <p className="mt-1 text-sm text-muted">Connecte-toi pour retrouver ton stock.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
            Email
            <div className="relative">
              <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </div>
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
            Mot de passe
            <div className="relative">
              <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
              />
            </div>
          </label>

          {error && <p className="text-sm font-medium text-amber">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-teal py-3 font-bold text-white shadow-md disabled:opacity-60"
          >
            <LogIn size={18} /> {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  )
}
