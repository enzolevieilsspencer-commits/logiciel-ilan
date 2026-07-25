import { Plus } from 'lucide-react'

interface FabProps {
  onClick: () => void
}

/** Bouton flottant « + » (ajout) — mobile uniquement (desktop : bouton dans la Sidebar). */
export function Fab({ onClick }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ajouter une pièce"
      className="fixed bottom-20 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white shadow-lg md:hidden"
    >
      <Plus size={28} />
    </button>
  )
}
