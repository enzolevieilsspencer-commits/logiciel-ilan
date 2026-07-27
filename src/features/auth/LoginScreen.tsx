import { useState, type FormEvent } from 'react'
import { Mail, Lock, LogIn, UserPlus, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Mode = 'signin' | 'signup' | 'reset'

/**
 * Écran de connexion / inscription / réinitialisation.
 * Chaque utilisateur crée son compte (email + mot de passe) via Supabase ;
 * ses données sont isolées automatiquement par les policies RLS (user_id).
 */
export function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    // Réinitialisation : on envoie un email avec un lien de récupération.
    if (mode === 'reset') {
      setSubmitting(true)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      setSubmitting(false)
      if (resetError) {
        setError("Impossible d'envoyer l'email. Vérifie l'adresse.")
        return
      }
      setInfo('Email envoyé ! Clique sur le lien reçu pour choisir un nouveau mot de passe.')
      return
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.')
      return
    }

    setSubmitting(true)

    if (mode === 'signin') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      // Sur succès, onAuthStateChange bascule l'app vers l'accueil (pas de setState ici).
      if (signInError) {
        setError('Email ou mot de passe incorrect.')
        setSubmitting(false)
      }
      return
    }

    // Inscription
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes('already')
          ? 'Un compte existe déjà avec cet email.'
          : "Impossible de créer le compte. Réessaie.",
      )
      setSubmitting(false)
      return
    }
    // Si la confirmation par email est activée, aucune session n'est ouverte tout de suite.
    if (!data.session) {
      setInfo('Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse.')
      setSubmitting(false)
    }
    // Sinon, onAuthStateChange bascule automatiquement vers l'accueil.
  }

  function goTo(next: Mode) {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  const isSignup = mode === 'signup'
  const isReset = mode === 'reset'

  const subtitle = isReset
    ? 'Reçois un lien pour réinitialiser ton mot de passe.'
    : isSignup
      ? 'Crée ton compte pour gérer ton stock.'
      : 'Connecte-toi pour retrouver ton stock.'

  const submitLabel = isReset
    ? submitting
      ? 'Envoi…'
      : 'Envoyer le lien'
    : isSignup
      ? submitting
        ? 'Création…'
        : 'Créer mon compte'
      : submitting
        ? 'Connexion…'
        : 'Se connecter'

  const fieldClass =
    'w-full rounded-[var(--radius-md)] bg-app py-3 pl-11 pr-4 text-base text-ink outline-none focus:ring-2 focus:ring-teal'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-surface to-app p-6 text-ink">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-[var(--radius-card)] bg-surface p-8 shadow-xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/logo-rounded.png" alt="" className="h-16 w-16 drop-shadow-md" />
          <div>
            <h1 className="text-xl font-bold text-teal-dark">Vendly</h1>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
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

          {!isReset && (
            <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
              <span className="flex items-center justify-between">
                Mot de passe
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => goTo('reset')}
                    className="text-xs font-semibold text-teal-dark underline underline-offset-2"
                  >
                    Oublié ?
                  </button>
                )}
              </span>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </label>
          )}

          {error && <p className="text-sm font-medium text-amber">{error}</p>}
          {info && <p className="text-sm font-medium text-green">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-teal py-3 font-bold text-white shadow-md disabled:opacity-60"
          >
            {isReset ? <Send size={18} /> : isSignup ? <UserPlus size={18} /> : <LogIn size={18} />}
            {submitLabel}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          {isReset ? (
            <button
              type="button"
              onClick={() => goTo('signin')}
              className="font-semibold text-teal-dark underline underline-offset-2"
            >
              Retour à la connexion
            </button>
          ) : (
            <>
              {isSignup ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
              <button
                type="button"
                onClick={() => goTo(isSignup ? 'signin' : 'signup')}
                className="font-semibold text-teal-dark underline underline-offset-2"
              >
                {isSignup ? 'Se connecter' : 'Créer un compte'}
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  )
}
