import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export const createRoom = mutation({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    let code = generateRoomCode()
    // Ensure unique code
    let existing = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique()
    while (existing) {
      code = generateRoomCode()
      existing = await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique()
    }
    await ctx.db.insert("rooms", {
      code,
      prompt: args.prompt,
      status: "waiting",
      currentQuestion: 0,
      score: 0,
      createdAt: Date.now(),
    })
    return code
  },
})

export const getRoom = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique()
  },
})

export const startGame = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique()
    if (!room) throw new Error("Room not found")
    await ctx.db.patch(room._id, { status: "active", currentQuestion: 0 })
  },
})

export const advanceQuestion = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique()
    if (!room) throw new Error("Room not found")

    const currentIndex = room.currentQuestion
    const question = await ctx.db
      .query("questions")
      .withIndex("by_room_and_index", (q) =>
        q.eq("roomCode", args.code).eq("index", currentIndex)
      )
      .unique()
    if (!question) throw new Error("Question not found")

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room_question", (q) =>
        q.eq("roomCode", args.code).eq("questionIndex", currentIndex)
      )
      .take(1000)

    const tally: Record<string, number> = {}
    for (const vote of votes) {
      tally[vote.answer] = (tally[vote.answer] ?? 0) + 1
    }

    let winner = question.options[0]
    let maxVotes = 0
    for (const option of question.options) {
      const count = tally[option] ?? 0
      if (count > maxVotes) {
        maxVotes = count
        winner = option
      }
    }

    const isCorrect = winner === question.correctAnswer
    const newScore = isCorrect ? room.score + 10 : room.score

    if (currentIndex === 9) {
      await ctx.db.patch(room._id, { score: newScore, status: "finished" })
    } else {
      await ctx.db.patch(room._id, {
        score: newScore,
        currentQuestion: currentIndex + 1,
      })
    }
  },
})

export const endGame = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique()
    if (!room) throw new Error("Room not found")
    await ctx.db.patch(room._id, { status: "finished" })
  },
})
