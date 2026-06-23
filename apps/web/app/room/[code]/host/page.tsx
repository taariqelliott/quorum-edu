"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/api"
import { useParams } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { QuestionCard } from "@/components/QuestionCard"
import { VoteTally } from "@/components/VoteTally"
import { ScoreBoard, FinalScoreBoard } from "@/components/ScoreBoard"
import { RecapPDF } from "@/components/RecapPDF"
import Link from "next/link"

export default function HostView() {
  const params = useParams()
  const code = params.code as string

  const room = useQuery(api.rooms.getRoom, { code })
  const question = useQuery(
    api.questions.getQuestion,
    room?.status === "active"
      ? { roomCode: code, index: room.currentQuestion }
      : "skip"
  )
  const votes = useQuery(
    api.votes.getVotes,
    room?.status === "active"
      ? { roomCode: code, questionIndex: room.currentQuestion }
      : "skip"
  )
  const allQuestions = useQuery(
    api.questions.getQuestions,
    room?.status === "finished" ? { roomCode: code } : "skip"
  )

  const advanceQuestion = useMutation(api.rooms.advanceQuestion)
  const [revealed, setRevealed] = useState(false)

  if (room === undefined || room === null) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (room.status === "finished") {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-3xl font-bold">Game Over!</h1>
        <FinalScoreBoard score={room.score} />
        {allQuestions && (
          <RecapPDF
            roomCode={code}
            prompt={room.prompt}
            score={room.score}
            questions={allQuestions}
          />
        )}
        <Button>
          <Link href="/">Start A New Game</Link>
        </Button>
      </main>
    )
  }

  const isLastQuestion = room.currentQuestion === 9

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col items-center gap-8 p-8">
      <div className="flex w-full items-center justify-between gap-4">
        <ScoreBoard score={room.score} currentQuestion={room.currentQuestion} />
        <Button
          size="lg"
          onClick={() => {
            setRevealed(false)
            advanceQuestion({ code })
          }}
          disabled={question === undefined}
        >
          {isLastQuestion ? "End Game" : "Next Question →"}
        </Button>
      </div>

      {question && (
        <div className="flex w-full flex-col items-center gap-8 rounded-2xl border bg-card p-8 text-center shadow-sm">
          <QuestionCard question={question.question} index={question.index} />

          <div className="w-full text-left">
            <VoteTally
              options={question.options}
              votes={votes ?? []}
              correctAnswer={question.correctAnswer}
              showCorrect={revealed}
            />
          </div>

          <Button
            variant={revealed ? "secondary" : "outline"}
            onClick={() => setRevealed((r) => !r)}
          >
            {revealed ? "✓ Correct Answer Shown" : "Reveal Correct Answer"}
          </Button>

          <p className="text-sm text-muted-foreground">
            {votes?.length ?? 0} vote{votes?.length !== 1 ? "s" : ""} in
          </p>
        </div>
      )}
    </main>
  )
}
