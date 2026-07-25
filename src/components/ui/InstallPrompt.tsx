import { useEffect, useState } from 'react'
import { Download, Share, X, Plus } from 'lucide-react'

/** Event `beforeinstallprompt` (Chrome/Android) — non typé par défaut. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'installPromptDismissed'

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

/**
 * Invite à installer l'app sur l'écran d'accueil, affichée une fois connecté.
 * - Android/Chrome : bouton natif d'installation (via beforeinstallprompt).
 * - iOS Safari : instructions (Partager → « Sur l'écran d'accueil »).
 * Masquée si l'app est déjà installée (standalone) ou si l'invite a été rejetée.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(DISMISS_KEY) === '1') return

    // iOS n'émet pas beforeinstallprompt : on affiche directement les instructions.
    if (isIos()) {
      setVisible(true)
      return
    }

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // localStorage indisponible : on masque juste pour cette session.
    }
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    dismiss()
  }

  const ios = isIos()

  return (
    <div
      className="fixed inset-x-3 z-30 rounded-[var(--radius-card)] bg-surface p-4 shadow-xl md:hidden"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 88px)' }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fermer"
        className="absolute right-3 top-3 text-muted"
      >
        <X size={18} />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <img src="/logo-rounded.png" alt="" className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="text-sm">
          <p className="font-semibold text-ink">Installe Vendly</p>
          {ios ? (
            <p className="mt-1 leading-relaxed text-muted">
              Appuie sur <Share size={14} className="inline align-[-2px] text-teal" /> (Partager) en
              bas de Safari, puis choisis{' '}
              <span className="font-medium text-ink">
                « Sur l'écran d'accueil <Plus size={12} className="inline align-[-1px]" /> »
              </span>
              .
            </p>
          ) : (
            <p className="mt-1 leading-relaxed text-muted">
              Ajoute l'app à ton écran d'accueil pour la lancer en un tap, comme une vraie appli.
            </p>
          )}
        </div>
      </div>

      {!ios && (
        <button
          type="button"
          onClick={install}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-teal py-2.5 text-sm font-bold text-white"
        >
          <Download size={16} /> Ajouter à l'écran d'accueil
        </button>
      )}
    </div>
  )
}
