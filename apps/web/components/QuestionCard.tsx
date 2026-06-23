interface QuestionCardProps {
  question: string
  index: number
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Question {index + 1} of 10
      </p>
      <h2 className="text-2xl font-bold leading-tight">{question}</h2>
    </div>
  )
}
