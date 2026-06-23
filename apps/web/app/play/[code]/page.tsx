"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/api"
import { QuestionCard } from "@/components/QuestionCard"
import { VoteOptions } from "@/components/VoteOptions"
import { VoteTally } from "@/components/VoteTally"
import { FinalScoreBoard } from "@/components/ScoreBoard"

function PlayView({ code }: { code: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    const urlName = searchParams.get("name")
    const saved = localStorage.getItem("quorum_name")
    const resolved = urlName ?? saved
    if (!resolved) {
      router.replace(`/join?code=${code}`)
      return
    }
    setName(resolved)
  }, [code, router, searchParams])

  const room = useQuery(api.rooms.getRoom, { code })
  const players = useQuery(api.players.getPlayers, { roomCode: code })
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
  const myVote = useQuery(
    api.votes.getPlayerVote,
    room?.status === "active" && name
      ? { roomCode: code, questionIndex: room.currentQuestion, playerName: name }
      : "skip"
  )
  const allQuestions = useQuery(
    api.questions.getQuestions,
    room?.status === "finished" ? { roomCode: code } : "skip"
  )

  const submitVote = useMutation(api.votes.submitVote)

  // Stale localStorage name from a prior game ≠ membership in this room.
  // If we're not actually registered, route through /join so the host sees us.
  useEffect(() => {
    if (!name || !room || !players) return
    if (room.status === "finished") return
    if (!players.some((p) => p.name === name)) {
      router.replace(`/join?code=${code}`)
    }
  }, [name, room, players, code, router])

  const handleVote = async (answer: string) => {
    if (!name || !room) return
    await submitVote({
      roomCode: code,
      questionIndex: room.currentQuestion,
      playerName: name,
      answer,
    })
  }

  if (!name || room === undefined || room === null) {
    return <div className="flex min-h-svh items-center justify-center text-muted-foreground">Loading...</div>
  }

  if (room.status === "waiting") {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center p-6 gap-4 text-center">
        <div className="text-5xl">⏳</div>
        <h1 className="text-2xl font-bold">Waiting for teacher to start...</h1>
        <p className="text-sm text-muted-foreground font-mono">{name}</p>
      </main>
    )
  }

  if (room.status === "finished") {
    return (
      <main className="flex min-h-svh flex-col p-6 gap-6">
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-2xl font-bold">Game Over!</h1>
          <FinalScoreBoard score={room.score} />
        </div>
        <div className="flex flex-col gap-4 pb-8">
          {allQuestions?.map((q) => (
            <div key={q._id} className="flex flex-col gap-2 rounded-xl border p-4">
              <p className="font-semibold">
                Q{q.index + 1}: {q.question}
              </p>
              <p className="text-sm font-medium text-green-600">✓ {q.correctAnswer}</p>
              <p className="text-sm text-muted-foreground">{q.definition}</p>
              <p className="text-sm text-muted-foreground italic">{q.example}</p>
            </div>
          ))}
        </div>
      </main>
    )
  }

  // active
  const hasVoted = myVote !== null && myVote !== undefined

  return (
    <main className="flex min-h-svh flex-col p-6 gap-6">
      {question && <QuestionCard question={question.question} index={question.index} />}

      {hasVoted ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            You voted: <span className="font-medium">{myVote?.answer}</span>
          </p>
          {question && votes && (
            <VoteTally options={question.options} votes={votes} />
          )}
        </div>
      ) : (
        question && (
          <VoteOptions options={question.options} selected={null} onVote={handleVote} />
        )
      )}
    </main>
  )
}

export default function PlayPage() {
  const params = useParams()
  const code = params.code as string

  return (
    <Suspense fallback={<div className="flex min-h-svh items-center justify-center text-muted-foreground">Loading...</div>}>
      <PlayView code={code} />
    </Suspense>
  )
}
