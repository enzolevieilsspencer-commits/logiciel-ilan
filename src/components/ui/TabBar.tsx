import { Plus } from 'lucide-react'
import { NAV_ITEMS, type TabKey } from './nav'

export type { TabKey }

interface TabBarProps {
  active: TabKey
  onChange: (tab: TabKey) => void
  onAdd: () => void
}

/** Barre de navigation basse — mobile uniquement (le desktop utilise la Sidebar).
 *  Le bouton « + » (ajout) est intégré au centre de la barre. */
export function TabBar({ active, onChange, onAdd }: TabBarProps) {
  // Répartit les onglets de part et d'autre du bouton « + » central.
  const half = Math.ceil(NAV_ITEMS.length / 2)
  const left = NAV_ITEMS.slice(0, half)
  const right = NAV_ITEMS.slice(half)

  const renderTab = ({ key, label, icon: Icon }: (typeof NAV_ITEMS)[number]) => {
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
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex items-end border-t border-black/5 bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      {left.map(renderTab)}

      {/* Bouton d'ajout central, légèrement surélevé. */}
      <div className="flex flex-1 justify-center">
        <button
          type="button"
          onClick={onAdd}
          aria-label="Ajouter une pièce"
          className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white shadow-lg ring-4 ring-surface"
        >
          <Plus size={28} />
        </button>
      </div>

      {right.map(renderTab)}
    </nav>
  )
}
