import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const submitVote = mutation({
  args: {
    roomCode: v.string(),
    questionIndex: v.number(),
    playerName: v.string(),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_room_question", (q) =>
        q.eq("roomCode", args.roomCode).eq("questionIndex", args.questionIndex)
      )
      .take(1000)
    const alreadyVoted = existing.find((v) => v.playerName === args.playerName)
    if (alreadyVoted) return // idempotent — silently ignore duplicate vote

    await ctx.db.insert("votes", {
      roomCode: args.roomCode,
      questionIndex: args.questionIndex,
      playerName: args.playerName,
      answer: args.answer,
    })
  },
})

export const getVotes = query({
  args: { roomCode: v.string(), questionIndex: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("votes")
      .withIndex("by_room_question", (q) =>
        q.eq("roomCode", args.roomCode).eq("questionIndex", args.questionIndex)
      )
      .take(1000)
  },
})

export const getPlayerVote = query({
  args: {
    roomCode: v.string(),
    questionIndex: v.number(),
    playerName: v.string(),
  },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room_question", (q) =>
        q.eq("roomCode", args.roomCode).eq("questionIndex", args.questionIndex)
      )
      .take(1000)
    return votes.find((v) => v.playerName === args.playerName) ?? null
  },
})
