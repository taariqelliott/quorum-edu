"use client"

interface VoteTallyProps {
  options: string[]
  votes: { answer: string }[]
  correctAnswer?: string
  showCorrect?: boolean
}

export function VoteTally({ options, votes, correctAnswer, showCorrect }: VoteTallyProps) {
  const counts: Record<string, number> = {}
  for (const opt of options) counts[opt] = 0
  for (const v of votes) counts[v.answer] = (counts[v.answer] ?? 0) + 1

  const total = votes.length || 1
  const maxCount = Math.max(...Object.values(counts), 1)

  return (
    <div className="flex flex-col gap-4">
      {options.map((opt) => {
        const count = counts[opt] ?? 0
        const pct = Math.round((count / total) * 100)
        const isCorrect = showCorrect && opt === correctAnswer
        return (
          <div key={opt} className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className={isCorrect ? "font-bold text-green-600" : ""}>{opt}</span>
              <span className="text-muted-foreground">
                {count} {count === 1 ? "vote" : "votes"} ({pct}%)
              </span>
            </div>
            <div className="h-5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCorrect ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
