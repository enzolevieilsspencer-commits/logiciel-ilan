interface FabProps {
  onClick: () => void
}

/** Bouton flottant « + » (ajout d'une pièce), au-dessus de la tabbar. */
export function Fab({ onClick }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ajouter une pièce"
      className="fixed bottom-20 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-3xl leading-none text-white shadow-lg"
    >
      +
    </button>
  )
}
