export type TabKey = 'accueil' | 'stock' | 'stats' | 'reglages'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'accueil', label: 'Accueil', icon: '🏠' },
  { key: 'stock', label: 'Stock', icon: '📦' },
  { key: 'stats', label: 'Stats', icon: '📊' },
  { key: 'reglages', label: 'Réglages', icon: '⚙️' },
]

interface TabBarProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-black/5 bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          aria-current={active === tab.key ? 'page' : undefined}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
            active === tab.key ? 'text-teal' : 'text-muted'
          }`}
        >
          <span className="text-lg">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
