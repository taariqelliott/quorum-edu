import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

const questionValidator = v.object({
  index: v.number(),
  question: v.string(),
  options: v.array(v.string()),
  correctAnswer: v.string(),
  definition: v.string(),
  example: v.string(),
})

export const storeQuestions = mutation({
  args: {
    roomCode: v.string(),
    questions: v.array(questionValidator),
  },
  handler: async (ctx, args) => {
    for (const q of args.questions) {
      await ctx.db.insert("questions", {
        roomCode: args.roomCode,
        index: q.index,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        definition: q.definition,
        example: q.example,
      })
    }
  },
})

export const getQuestions = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_room_and_index", (q) => q.eq("roomCode", args.roomCode))
      .take(10)
  },
})

export const getQuestion = query({
  args: { roomCode: v.string(), index: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_room_and_index", (q) =>
        q.eq("roomCode", args.roomCode).eq("index", args.index)
      )
      .unique()
  },
})
