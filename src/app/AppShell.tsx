import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { TabBar, type TabKey } from '../components/ui/TabBar'
import { Fab } from '../components/ui/Fab'
import { usePieces } from '../features/pieces/usePieces'
import { StockScreen } from '../features/pieces/StockScreen'
import { AddPieceScreen } from '../features/pieces/AddPieceScreen'
import type { Piece } from '../features/pieces/types'

export function AppShell() {
  const [tab, setTab] = useState<TabKey>('stock')
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState<Piece | null>(null)
  const { pieces, urls, loading, error, refresh } = usePieces()

  // Overlay d'ajout (ouvert par le FAB).
  if (adding) {
    return (
      <AddPieceScreen
        onCancel={() => setAdding(false)}
        onAdded={() => {
          setAdding(false)
          refresh()
        }}
      />
    )
  }

  // Placeholder de la fiche pièce — la vraie fiche est la Story 2.3.
  if (selected) {
    return (
      <main className="min-h-screen bg-app text-ink flex flex-col items-center justify-center gap-3 p-6">
        <p className="font-semibold">{selected.categorie ?? 'Pièce'}</p>
        <p className="text-sm text-muted">La fiche détaillée arrive bientôt. 🛠️</p>
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="rounded-[var(--radius-md)] bg-white px-4 py-2 text-sm font-semibold text-teal-dark shadow"
        >
          ← Retour
        </button>
      </main>
    )
  }

  const showFab = tab === 'accueil' || tab === 'stock'

  return (
    <div className="min-h-screen bg-app pb-20">
      {tab === 'accueil' && (
        <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-2 p-6 pt-16 text-center">
          <h1 className="text-2xl font-bold text-teal-dark">Salut Ilan 👋</h1>
          <p className="text-muted">
            {pieces.length} pièce{pieces.length > 1 ? 's' : ''} en stock
          </p>
          <p className="text-sm text-muted">Ton tableau de bord arrive bientôt. 📊</p>
        </div>
      )}

      {tab === 'stock' && (
        <StockScreen pieces={pieces} urls={urls} loading={loading} error={error} onSelect={setSelected} />
      )}

      {tab === 'stats' && (
        <div className="flex flex-col items-center justify-center gap-2 p-6 pt-24 text-center">
          <span className="text-4xl">📊</span>
          <p className="text-muted">Tes stats et ton historique arrivent bientôt.</p>
        </div>
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
