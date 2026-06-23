"use client"

import { generateName } from "@/lib/nameGenerator"
import { api } from "@convex/api"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { useMutation } from "convex/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

function JoinForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [code, setCode] = useState(searchParams.get("code") ?? "")
  const [name, setName] = useState(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("quorum_name") ?? generateName())
      : ""
  )
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const joinRoom = useMutation(api.players.joinRoom)

  const shuffle = () => setName(generateName())

  const handleJoin = async () => {
    if (!code.trim() || !name.trim()) return
    setLoading(true)
    setError("")
    try {
      await joinRoom({ roomCode: code.toUpperCase(), name })
      localStorage.setItem("quorum_name", name)
      router.push(
        `/play/${code.toUpperCase()}?name=${encodeURIComponent(name)}`
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not join room"
      setError(msg)
      if (msg.toLowerCase().includes("name")) {
        setName(generateName())
      }
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Input
        placeholder="Room code (e.g. ABCD23)"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="h-14 text-center font-mono text-xl tracking-widest"
        maxLength={6}
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Your name:</p>
        <div className="flex gap-2">
          <div className="flex-1 truncate rounded-md border bg-muted px-3 py-2 font-mono text-sm">
            {name}
          </div>
          <Button
            variant="outline"
            onClick={shuffle}
            type="button"
            disabled={loading}
          >
            Shuffle
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        size="lg"
        onClick={handleJoin}
        disabled={loading || !code.trim() || !name.trim()}
        className="w-full"
      >
        {loading ? "Joining..." : "Join"}
      </Button>
    </div>
  )
}

export default function JoinPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Join Game</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your room code to play
        </p>
      </div>
      <Suspense
        fallback={<div className="text-muted-foreground">Loading...</div>}
      >
        <JoinForm />
      </Suspense>
    </main>
  )
}
