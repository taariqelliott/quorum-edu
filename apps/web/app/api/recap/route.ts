import { generateRecapIntro } from "@/lib/claude"
import { recapRatelimit } from "@/app/api/redis"
import { api } from "@convex/api"
import { ConvexHttpClient } from "convex/browser"
import { NextRequest, NextResponse } from "next/server"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous"
  const { success } = await recapRatelimit.limit(ip)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const { roomCode, prompt, score } = await request.json()
    const questions = await convex.query(api.questions.getQuestions, {
      roomCode,
    })
    const intro = await generateRecapIntro(prompt, score, questions)
    return NextResponse.json({ intro })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate recap"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
