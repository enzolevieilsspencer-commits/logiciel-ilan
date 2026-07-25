import { useEffect, useState } from 'react'
import { LogOut, Moon, Sun, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function isDark(): boolean {
  return document.documentElement.classList.contains('dark')
}

function applyDark(v: boolean) {
  document.documentElement.classList.toggle('dark', v)
  localStorage.setItem('theme', v ? 'dark' : 'light')
}

export function SettingsScreen() {
  const [email, setEmail] = useState('')
  const [dark, setDark] = useState(isDark())

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
  }, [])

  function toggle() {
    const next = !dark
    applyDark(next)
    setDark(next)
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-5 md:p-8">
      <h1 className="text-2xl font-bold text-ink">Réglages</h1>

      {/* Compte */}
      <div className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-app text-teal-dark">
            <User size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Compte</p>
            <p className="truncate text-sm text-muted">{email || '…'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="mt-4 flex items-center gap-2 rounded-[var(--radius-md)] bg-app px-4 py-2.5 text-sm font-semibold text-teal-dark"
        >
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>

      {/* Thème */}
      <div className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-app text-teal-dark">
              {dark ? <Moon size={20} /> : <Sun size={20} />}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Thème</p>
              <p className="text-sm text-muted">{dark ? 'Sombre' : 'Clair'}</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={dark}
            aria-label="Basculer le thème sombre"
            onClick={toggle}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${dark ? 'bg-teal' : 'bg-app'}`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-surface shadow transition-all ${
                dark ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
