interface ChipsProps {
  options: readonly string[]
  value: string | null
  onChange: (value: string) => void
}

/** Sélecteur mono-choix au tap (liste fermée). Chip sélectionnée = teal plein. */
export function Chips({ options, value, onChange }: ChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={selected}
            className={
              selected
                ? 'rounded-full bg-teal px-3.5 py-2 text-sm font-semibold text-white'
                : 'rounded-full border border-[color:var(--color-teal)]/25 bg-white px-3.5 py-2 text-sm text-muted'
            }
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
