interface QuestionCardProps {
  question: string
  index: number
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <span className="inline-flex w-fit items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
        Question {index + 1} of 10
      </span>
      <h2 className="text-xl font-bold leading-snug">{question}</h2>
    </div>
  )
}
