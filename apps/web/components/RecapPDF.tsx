"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, Download, FileText, Loader2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { QuestionSummary } from "@/lib/pdf"

interface RecapPDFProps {
  roomCode: string
  prompt: string
  score: number
  questions: QuestionSummary[]
}

export function RecapPDF({ roomCode, prompt, score, questions }: RecapPDFProps) {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    setState("loading")
    setError("")
    try {
      const res = await fetch("/api/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, prompt, score }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const { buildRecapPDF } = await import("@/lib/pdf")
      await buildRecapPDF(data.intro, prompt, score, questions)
      setState("ready")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate recap")
      setState("error")
    }
  }

  if (state === "loading") {
    return (
      <p className="flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Generating report...
      </p>
    )
  }

  if (state === "ready") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="flex items-center justify-center gap-2 font-medium text-green-600">
          <CheckCircle2 className="size-4" />
          Report Ready
        </p>
        <Button variant="outline" onClick={handleGenerate}>
          <Download className="size-4" />
          Download Again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Button onClick={handleGenerate}>
        <FileText className="size-4" />
        Generate Recap
      </Button>
      {error && (
        <p className="flex items-center justify-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error}
        </p>
      )}
    </div>
  )
}
