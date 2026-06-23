"use client"

import { QuestionCard } from "@/components/QuestionCard"
import { RecapPDF } from "@/components/RecapPDF"
import { FinalScoreBoard, ScoreBoard } from "@/components/ScoreBoard"
import { VoteTally } from "@/components/VoteTally"
import { api } from "@convex/api"
import { Button } from "@workspace/ui/components/button"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

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
  const previousQuestion = useMutation(api.rooms.previousQuestion)
  const [revealed, setRevealed] = useState(false)

  if (room === undefined || room === null) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (room.status === "finished") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-3xl font-bold">Game Over!</h1>
        <FinalScoreBoard score={room.score} />
        <Button>
          <Link href="/">Start A New Game</Link>
        </Button>
        {allQuestions && (
          <RecapPDF
            roomCode={code}
            prompt={room.prompt}
            score={room.score}
            questions={allQuestions}
          />
        )}
      </main>
    )
  }

  const isLastQuestion = room.currentQuestion === 9

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-8 p-8">
      <div className="flex w-full items-center justify-between gap-4">
        <ScoreBoard score={room.score} currentQuestion={room.currentQuestion} />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setRevealed(false)
              previousQuestion({ code })
            }}
            disabled={question === undefined || room.currentQuestion === 0}
          >
            ← Previous
          </Button>
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
