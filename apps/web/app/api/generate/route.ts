import { generateQuestions } from "@/lib/claude"
import { getGenerateRatelimit } from "@/app/api/redis"
import { api } from "@convex/api"
import { ConvexHttpClient } from "convex/browser"
import { NextRequest, NextResponse } from "next/server"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous"
    const { success } = await getGenerateRatelimit().limit(ip)
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const { prompt } = await request.json()
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const questions = await generateQuestions(prompt)
    const code = await convex.mutation(api.rooms.createRoom, { prompt })
    await convex.mutation(api.questions.storeQuestions, {
      roomCode: code,
      questions,
    })

    return NextResponse.json({ code })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create game"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
