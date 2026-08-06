import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { TabBar } from '../components/ui/TabBar'
import { Sidebar } from '../components/ui/Sidebar'
import { InstallPrompt } from '../components/ui/InstallPrompt'
import type { TabKey } from '../components/ui/nav'
import { usePieces } from '../features/pieces/usePieces'
import { StockScreen } from '../features/pieces/StockScreen'
import { HistoryScreen } from '../features/pieces/HistoryScreen'
import { AddPieceScreen } from '../features/pieces/AddPieceScreen'
import { PieceDetailScreen } from '../features/pieces/PieceDetailScreen'
import { useDashboard } from '../features/dashboard/useDashboard'
import { DashboardScreen } from '../features/dashboard/DashboardScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { useBoxes } from '../features/boxes/useBoxes'
import { BoxListScreen } from '../features/boxes/BoxListScreen'
import { BoxDetailScreen } from '../features/boxes/BoxDetailScreen'
import { AddBoxScreen } from '../features/boxes/AddBoxScreen'
import { AssignArticlesScreen } from '../features/boxes/AssignArticlesScreen'
import type { Box } from '../features/boxes/types'
import type { Piece } from '../features/pieces/types'

type StockView = 'articles' | 'box'

export function AppShell() {
  const [tab, setTab] = useState<TabKey>('accueil')
  const [stockView, setStockView] = useState<StockView>('articles')
  const [adding, setAdding] = useState(false)
  const [addDefaultBoxId, setAddDefaultBoxId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Piece | null>(null)
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null)
  const [addingBox, setAddingBox] = useState(false)
  const [editingBox, setEditingBox] = useState<Box | null>(null)
  const [assigningToBox, setAssigningToBox] = useState<Box | null>(null)

  const { pieces, urls, loading, error, refresh } = usePieces('en_stock')
  const history = usePieces('vendue')
  const dashboard = useDashboard()
  const { boxes, refresh: refreshBoxes } = useBoxes()

  // Toutes les pièces (stock + vendues) pour les calculs de box.
  const allPieces = [...pieces, ...history.pieces]
  const allUrls = { ...urls, ...history.urls }
  // Section « Articles » : uniquement les pièces à l'unité (celles rattachées à une box y vivent).
  const stockArticles = pieces.filter((p) => p.box_id == null)
  const selectedBox = boxes.find((b) => b.id === selectedBoxId) ?? null

  // Rafraîchit stock + historique + tableau de bord + box après toute mutation.
  const refreshAll = () => {
    refresh()
    history.refresh()
    dashboard.refresh()
    refreshBoxes()
  }

  // — Overlays plein écran (priorité décroissante) —

  if (addingBox || editingBox) {
    return (
      <AddBoxScreen
        box={editingBox}
        onCancel={() => {
          setAddingBox(false)
          setEditingBox(null)
        }}
        onSaved={() => {
          setAddingBox(false)
          setEditingBox(null)
          refreshBoxes()
        }}
      />
    )
  }

  if (assigningToBox) {
    return (
      <AssignArticlesScreen
        box={assigningToBox}
        pieces={allPieces}
        urls={allUrls}
        onCancel={() => setAssigningToBox(null)}
        onDone={() => {
          setAssigningToBox(null)
          refreshAll()
        }}
      />
    )
  }

  if (adding) {
    return (
      <AddPieceScreen
        boxes={boxes}
        defaultBoxId={addDefaultBoxId}
        onCancel={() => {
          setAdding(false)
          setAddDefaultBoxId(null)
        }}
        onAdded={() => {
          setAdding(false)
          setAddDefaultBoxId(null)
          refreshAll()
        }}
      />
    )
  }

  if (selected) {
    return (
      <PieceDetailScreen
        piece={selected}
        boxes={boxes}
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

  if (selectedBox) {
    return (
      <BoxDetailScreen
        box={selectedBox}
        pieces={allPieces}
        urls={allUrls}
        onBack={() => setSelectedBoxId(null)}
        onEdit={(box) => setEditingBox(box)}
        onDeleted={() => {
          setSelectedBoxId(null)
          refreshAll()
        }}
        onAddArticle={(box) => {
          setAddDefaultBoxId(box.id)
          setAdding(true)
        }}
        onAddExisting={(box) => setAssigningToBox(box)}
        onSelectPiece={(piece) => setSelected(piece)}
      />
    )
  }

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
            boxes={boxes}
            empty={dashboard.empty}
            loading={dashboard.loading}
            error={dashboard.error}
            onAdd={() => setAdding(true)}
          />
        )}

        {tab === 'stock' && (
          <div className="mx-auto max-w-3xl px-4 pt-4 md:px-6 md:pt-6">
            {/* Bascule Articles / Box */}
            <div className="mb-1 flex gap-1 rounded-full bg-surface p-1 shadow-sm">
              {(['articles', 'box'] as StockView[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setStockView(v)}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                    stockView === v ? 'bg-teal text-white' : 'text-muted'
                  }`}
                >
                  {v === 'articles' ? 'Articles' : 'Box'}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'stock' && stockView === 'articles' && (
          <StockScreen pieces={stockArticles} urls={urls} loading={loading} error={error} onSelect={setSelected} />
        )}

        {tab === 'stock' && stockView === 'box' && (
          <BoxListScreen
            boxes={boxes}
            pieces={allPieces}
            loading={loading || history.loading}
            error={error}
            onSelect={(box) => setSelectedBoxId(box.id)}
            onAdd={() => setAddingBox(true)}
          />
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

        {tab === 'reglages' && <SettingsScreen />}
      </main>

      <InstallPrompt />
      <TabBar active={tab} onChange={setTab} onAdd={() => setAdding(true)} />
    </div>
  )
}
