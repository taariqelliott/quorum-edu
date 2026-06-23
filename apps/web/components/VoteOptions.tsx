"use client"

const COLORS = [
  "bg-blue-500 hover:bg-blue-600 active:bg-blue-700",
  "bg-orange-500 hover:bg-orange-600 active:bg-orange-700",
  "bg-purple-500 hover:bg-purple-600 active:bg-purple-700",
  "bg-green-500 hover:bg-green-600 active:bg-green-700",
]

interface VoteOptionsProps {
  options: string[]
  selected: string | null
  onVote: (answer: string) => void
}

export function VoteOptions({ options, selected, onVote }: VoteOptionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt, i) => (
        <button
          key={opt}
          disabled={selected !== null}
          onClick={() => onVote(opt)}
          className={`rounded-2xl p-5 text-white text-base font-semibold text-left leading-snug transition-all active:scale-95 disabled:cursor-default ${COLORS[i]} ${
            selected === opt ? "ring-4 ring-white ring-offset-2" : ""
          } ${selected !== null && selected !== opt ? "opacity-50" : ""}`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
