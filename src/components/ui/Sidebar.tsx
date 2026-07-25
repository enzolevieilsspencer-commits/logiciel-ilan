import { LogOut, Plus } from 'lucide-react'
import { NAV_ITEMS, type TabKey } from './nav'

interface SidebarProps {
  active: TabKey
  onChange: (tab: TabKey) => void
  onAdd: () => void
  onLogout: () => void
}

/** Navigation latérale — desktop uniquement (le mobile utilise la TabBar). */
export function Sidebar({ active, onChange, onAdd, onLogout }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-black/5 bg-white p-4 md:flex">
      <div className="flex items-center gap-2.5 px-2 py-2">
        <img src="/logo-rounded.png" alt="" className="h-9 w-9" />
        <span className="font-bold leading-tight text-teal-dark">
          Vendly
          <span className="block text-xs font-medium text-muted">Stock &amp; marge</span>
        </span>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="my-4 flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-teal py-2.5 font-semibold text-white shadow-md"
      >
        <Plus size={18} /> Ajouter une pièce
      </button>

      <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted/70">Menu</p>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const on = active === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-current={on ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold ${
                on ? 'bg-app text-teal-dark' : 'text-muted hover:bg-app/60'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold text-muted hover:bg-app/60"
      >
        <LogOut size={18} /> Se déconnecter
      </button>
    </aside>
  )
}
