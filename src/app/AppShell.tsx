import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { TabBar } from '../components/ui/TabBar'
import { Sidebar } from '../components/ui/Sidebar'
import { Fab } from '../components/ui/Fab'
import type { TabKey } from '../components/ui/nav'
import { usePieces } from '../features/pieces/usePieces'
import { StockScreen } from '../features/pieces/StockScreen'
import { HistoryScreen } from '../features/pieces/HistoryScreen'
import { AddPieceScreen } from '../features/pieces/AddPieceScreen'
import { PieceDetailScreen } from '../features/pieces/PieceDetailScreen'
import { useDashboard } from '../features/dashboard/useDashboard'
import { DashboardScreen } from '../features/dashboard/DashboardScreen'
import type { Piece } from '../features/pieces/types'

export function AppShell() {
  const [tab, setTab] = useState<TabKey>('accueil')
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState<Piece | null>(null)
  const { pieces, urls, loading, error, refresh } = usePieces('en_stock')
  const history = usePieces('vendue')
  const dashboard = useDashboard()

  // Rafraîchit stock + historique + tableau de bord après toute mutation.
  const refreshAll = () => {
    refresh()
    history.refresh()
    dashboard.refresh()
  }

  if (adding) {
    return (
      <AddPieceScreen
        onCancel={() => setAdding(false)}
        onAdded={() => {
          setAdding(false)
          refreshAll()
        }}
      />
    )
  }

  if (selected) {
    return (
      <PieceDetailScreen
        piece={selected}
        onBack={() => setSelected(null)}
        onChanged={() => {
          setSelected(null)
          refreshAll()
        }}
        onDeleted={() => {
          setSelected(null)
          refreshAll()
        }}
      />
    )
  }

  const showFab = tab === 'accueil' || tab === 'stock'

  return (
    <div className="min-h-screen bg-app md:flex">
      <Sidebar
        active={tab}
        onChange={setTab}
        onAdd={() => setAdding(true)}
        onLogout={() => supabase.auth.signOut()}
      />

      <main className="min-h-screen flex-1 pb-20 md:pb-0">
        {tab === 'accueil' && (
          <DashboardScreen
            rows={dashboard.rows}
            empty={dashboard.empty}
            loading={dashboard.loading}
            error={dashboard.error}
            onAdd={() => setAdding(true)}
          />
        )}

        {tab === 'stock' && (
          <StockScreen pieces={pieces} urls={urls} loading={loading} error={error} onSelect={setSelected} />
        )}

        {tab === 'stats' && (
          <HistoryScreen
            pieces={history.pieces}
            urls={history.urls}
            loading={history.loading}
            error={history.error}
            onSelect={setSelected}
          />
        )}

        {tab === 'reglages' && (
          <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6 pt-10">
            <h1 className="text-xl font-bold text-teal-dark">Réglages</h1>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-2 self-start rounded-[var(--radius-md)] bg-white px-4 py-2.5 text-sm font-semibold text-teal-dark shadow"
            >
              <LogOut size={16} /> Se déconnecter
            </button>
          </div>
        )}
      </main>

      {showFab && <Fab onClick={() => setAdding(true)} />}
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
