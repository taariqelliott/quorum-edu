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
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Loading...</div>
  }

  if (room.status === "waiting") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-6 gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/15">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="size-5 rounded-full bg-primary" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">You&apos;re in!</h1>
          <p className="text-muted-foreground">Waiting for your teacher to start the game…</p>
        </div>
        <div className="rounded-full border border-border bg-card px-4 py-2 text-sm font-mono text-muted-foreground shadow-sm">
          {name}
        </div>
      </main>
    )
  }

  if (room.status === "finished") {
    return (
      <main className="flex flex-1 flex-col p-5 gap-6">
        <div className="flex flex-col items-center gap-3 text-center pt-4">
          <h1 className="text-3xl font-bold">Game Over!</h1>
          <FinalScoreBoard score={room.score} />
        </div>
        <div className="flex flex-col gap-3 pb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-2">
            Answer Key
          </p>
          {allQuestions?.map((q) => (
            <div key={q._id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold leading-snug">
                Q{q.index + 1}. {q.question}
              </p>
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2">
                <span className="text-green-600 font-bold text-sm">✓</span>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">{q.correctAnswer}</span>
              </div>
              {q.definition && (
                <p className="text-xs text-muted-foreground leading-relaxed">{q.definition}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    )
  }

  // active
  const hasVoted = myVote !== null && myVote !== undefined

  return (
    <main className="flex flex-1 flex-col p-5 gap-8">
      {question && <QuestionCard question={question.question} index={question.index} />}

      {hasVoted ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
            <span className="text-sm text-muted-foreground">Your answer:</span>
            <span className="text-sm font-semibold">{myVote?.answer}</span>
          </div>
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
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-muted-foreground">Loading...</div>}>
      <PlayView code={code} />
    </Suspense>
  )
}
