import { useState, type FormEvent } from 'react'
import { Lock, Check, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

/**
 * Écran de définition d'un nouveau mot de passe, affiché après clic sur le lien
 * de réinitialisation reçu par email (événement PASSWORD_RECOVERY).
 */
export function ResetPasswordScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.')
      return
    }
    setSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError('Impossible de mettre à jour le mot de passe. Réessaie.')
      setSubmitting(false)
      return
    }
    // Session déjà active via le lien : on rend la main à l'app.
    onDone()
  }

  const fieldClass =
    'w-full rounded-[var(--radius-md)] bg-app py-3 pl-11 pr-4 text-base text-ink outline-none focus:ring-2 focus:ring-teal'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-surface to-app p-6 text-ink">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-[var(--radius-card)] bg-surface p-8 shadow-xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/logo-rounded.png" alt="" className="h-16 w-16 drop-shadow-md" />
          <div>
            <h1 className="text-xl font-bold text-teal-dark">Nouveau mot de passe</h1>
            <p className="mt-1 text-sm text-muted">Choisis un nouveau mot de passe pour ton compte.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
            Mot de passe
            <div className="relative">
              <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${fieldClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && <p className="text-sm font-medium text-amber">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-teal py-3 font-bold text-white shadow-md disabled:opacity-60"
          >
            <Check size={18} /> {submitting ? 'Enregistrement…' : 'Valider'}
          </button>
        </form>
      </div>
    </main>
  )
}
