import { useEffect, useState } from 'react'

/** Vrai uniquement quand l'app tourne en PWA installée (mode standalone), pas dans le navigateur. */
function shouldShowSplash(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari expose `navigator.standalone`.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/**
 * Écran d'accueil (splash) affiché au lancement de la version mobile / PWA.
 * Logo de l'app + « Appuyer pour continuer » avec effets de lumière.
 * Se ferme au premier tap.
 */
export function Splash() {
  const [visible, setVisible] = useState(() => shouldShowSplash())
  const [leaving, setLeaving] = useState(false)

  // Bloque le scroll du body tant que le splash est affiché.
  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  if (!visible) return null

  const dismiss = () => {
    if (leaving) return
    setLeaving(true)
    // Laisse la transition de sortie se jouer avant de démonter.
    window.setTimeout(() => setVisible(false), 500)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Appuyer pour continuer"
      onClick={dismiss}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') dismiss()
      }}
      className={`splash fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden select-none ${
        leaving ? 'splash--leaving' : ''
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Halos de lumière ambiants animés en arrière-plan. */}
      <div className="splash-glow splash-glow--1" aria-hidden="true" />
      <div className="splash-glow splash-glow--2" aria-hidden="true" />

      {/* Logo avec halo lumineux pulsé + onde de lumière à l'apparition. */}
      <div className="splash-logo relative">
        <div className="splash-halo" aria-hidden="true" />
        <span className="splash-ring" aria-hidden="true" />
        <img
          src="/logo-rounded.png"
          alt="Vendly"
          width={128}
          height={128}
          className="splash-logo-img relative h-32 w-32 rounded-[28px] shadow-2xl"
          draggable={false}
        />
      </div>

      {/* Nom de l'app. */}
      <h1 className="splash-title mt-7 text-3xl font-semibold tracking-tight text-white">Vendly</h1>

      {/* Invite à continuer, avec effet de lumière balayante. */}
      <p className="splash-cta mt-4 text-sm font-medium tracking-wide uppercase">
        Appuyer pour continuer
      </p>
    </div>
  )
}
