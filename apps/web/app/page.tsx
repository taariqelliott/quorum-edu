"use client"

import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const LOADING_MESSAGES = [
  "Generating your questions…",
  "Working on it…",
  "Building your game…",
  "Almost there…",
  "Polishing the final touches…",
]

export default function Page() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    if (!loading) {
      setMsgIndex(0)
      return
    }
    const id = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1))
    }, 2200)
    return () => clearInterval(id)
  }, [loading])

  const handleCreate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/room/${data.code}`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      )
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div>
            <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              For educators
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">Quorum</h1>
          <p className="text-lg text-muted-foreground">
            Turn any lesson topic into a live multiplayer quiz in seconds.
          </p>
          <p className="text-sm text-muted-foreground/80 leading-relaxed">
            Describe what you want to teach. AI builds 10 questions instantly.
            Students join on their phones with a room code. No accounts, no downloads.
          </p>
        </div>

        <Textarea
          placeholder='e.g. "help my students learn about fractions in a fun way"'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px] resize-none border-border bg-card text-base shadow-sm"
          disabled={loading}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        {loading ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 shadow-sm">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-base font-medium" aria-live="polite">
              {LOADING_MESSAGES[msgIndex]}
            </p>
            <p className="text-sm text-muted-foreground">
              This usually takes a few seconds.
            </p>
          </div>
        ) : (
          <Button
            size="lg"
            onClick={handleCreate}
            disabled={!prompt.trim()}
            className="w-full"
          >
            Create Game
          </Button>
        )}
      </div>
    </main>
  )
}
