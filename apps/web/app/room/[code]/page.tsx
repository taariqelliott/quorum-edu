"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/api"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { QRCode } from "@/components/QRCode"

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
    return <div className="flex min-h-svh items-center justify-center text-muted-foreground">Loading...</div>
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-8 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Waiting Room</h1>
        <p className="text-muted-foreground mt-1">Students can join now</p>
      </div>

      <QRCode code={code} />

      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
          Room Code
        </p>
        <p className="text-5xl font-mono font-bold tracking-widest">{code}</p>
      </div>

      <div className="w-full max-w-sm">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          {players?.length ?? 0} student{players?.length !== 1 ? "s" : ""} joined
        </p>
        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto rounded-lg border p-2">
          {players?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Waiting for students to join...
            </p>
          )}
          {players?.map((p) => (
            <div key={p._id} className="rounded-md bg-muted px-3 py-2 text-sm font-mono">
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
