import { NAV_ITEMS, type TabKey } from './nav'

export type { TabKey }

interface TabBarProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

/** Barre de navigation basse — mobile uniquement (le desktop utilise la Sidebar). */
export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-black/5 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
        const on = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-current={on ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
              on ? 'text-teal' : 'text-muted'
            }`}
          >
            <Icon size={20} strokeWidth={on ? 2.4 : 2} />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
