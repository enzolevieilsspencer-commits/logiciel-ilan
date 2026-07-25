import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { TabBar, type TabKey } from '../components/ui/TabBar'
import { Fab } from '../components/ui/Fab'
import { usePieces } from '../features/pieces/usePieces'
import { StockScreen } from '../features/pieces/StockScreen'
import { HistoryScreen } from '../features/pieces/HistoryScreen'
import { AddPieceScreen } from '../features/pieces/AddPieceScreen'
import { PieceDetailScreen } from '../features/pieces/PieceDetailScreen'
import { useDashboard } from '../features/dashboard/useDashboard'
import { DashboardScreen } from '../features/dashboard/DashboardScreen'
import type { Piece } from '../features/pieces/types'

export function AppShell() {
  const [tab, setTab] = useState<TabKey>('stock')
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

  // Overlay d'ajout (ouvert par le FAB).
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

  // Fiche pièce (consulter / modifier / supprimer).
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
    <div className="min-h-screen bg-app pb-20">
      {tab === 'accueil' && (
        <DashboardScreen
          rows={dashboard.rows}
          empty={dashboard.empty}
          loading={dashboard.loading}
          error={dashboard.error}
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
        <div className="mx-auto flex max-w-md flex-col gap-4 p-6 pt-16">
          <h1 className="text-xl font-bold text-teal-dark">Réglages</h1>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="self-start rounded-[var(--radius-md)] bg-white px-4 py-2 text-sm font-semibold text-teal-dark shadow"
          >
            Se déconnecter
          </button>
        </div>
      )}

      {showFab && <Fab onClick={() => setAdding(true)} />}
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
