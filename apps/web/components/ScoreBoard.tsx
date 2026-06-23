interface ScoreBoardProps {
  score: number
  currentQuestion: number
}

export function ScoreBoard({ score, currentQuestion }: ScoreBoardProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
        Q{currentQuestion + 1} of 10
      </p>
      <p className="text-2xl font-bold">{score} pts</p>
    </div>
  )
}

export function FinalScoreBoard({ score }: { score: number }) {
  const correct = score / 10
  return (
    <p className="text-3xl font-bold text-center">
      {correct}/10 correct — {score} pts
    </p>
  )
}
