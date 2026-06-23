import { generateRecapIntro } from "@/lib/claude"
import { api } from "@convex/api"
import { ConvexHttpClient } from "convex/browser"
import { NextResponse } from "next/server"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: Request) {
  try {
    const { roomCode, prompt, score } = await request.json()
    const questions = await convex.query(api.questions.getQuestions, { roomCode })
    const intro = await generateRecapIntro(prompt, score, questions)
    return NextResponse.json({ intro })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate recap"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
