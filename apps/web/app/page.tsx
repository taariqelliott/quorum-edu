"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"

export default function Page() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.")
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tight">Quorum</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Type a topic — AI generates a 10-question class game in seconds.
          </p>
        </div>

        <Textarea
          placeholder='e.g. "help my students learn about fractions in a fun way"'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px] text-base resize-none"
          disabled={loading}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          size="lg"
          onClick={handleCreate}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Creating your game..." : "Create Game"}
        </Button>
      </div>
    </main>
  )
}
