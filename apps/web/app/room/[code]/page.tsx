"use client"

import { QRCode } from "@/components/QRCode"
import { api } from "@convex/api"
import { Button } from "@workspace/ui/components/button"
import { useMutation, useQuery } from "convex/react"
import { useParams, useRouter } from "next/navigation"

export default function WaitingRoom() {
  const params = useParams()
  const code = params.code as string
  const router = useRouter()

  const room = useQuery(api.rooms.getRoom, { code })
  const players = useQuery(api.players.getPlayers, { roomCode: code })
  const startGame = useMutation(api.rooms.startGame)

  const handleStart = async () => {
    await startGame({ code })
    router.push(`/room/${code}/host`)
  }

  if (room === undefined) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Waiting Room</h1>
        <p className="mt-1 text-muted-foreground">Students can join now</p>
      </div>

      <QRCode code={code} />

      <div className="text-center">
        <p className="mb-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Room Code
        </p>
        <p className="font-mono text-5xl font-bold tracking-widest">{code}</p>
      </div>

      <div className="w-full max-w-sm">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          {players?.length ?? 0} student{players?.length !== 1 ? "s" : ""}{" "}
          joined
        </p>
        <div className="flex max-h-52 flex-col gap-1 overflow-y-auto rounded-lg border p-2">
          {players?.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Waiting for students to join...
            </p>
          )}
          {players?.map((p) => (
            <div
              key={p._id}
              className="rounded-md bg-muted px-3 py-2 font-mono text-sm"
            >
              {p.name}
            </div>
          ))}
        </div>
      </div>

      <Button size="lg" onClick={handleStart} disabled={!players?.length}>
        Start Game →
      </Button>
    </main>
  )
}
