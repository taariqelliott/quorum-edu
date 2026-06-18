import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  rooms: defineTable({
    code: v.string(),
    prompt: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("active"),
      v.literal("finished")
    ),
    currentQuestion: v.number(),
    score: v.number(),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  players: defineTable({
    roomCode: v.string(),
    name: v.string(),
    joinedAt: v.number(),
  }).index("by_room", ["roomCode"]),

  questions: defineTable({
    roomCode: v.string(),
    index: v.number(),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.string(),
    definition: v.string(),
    example: v.string(),
  }).index("by_room", ["roomCode"]),

  votes: defineTable({
    roomCode: v.string(),
    questionIndex: v.number(),
    playerName: v.string(),
    answer: v.string(),
  }).index("by_room_question", ["roomCode", "questionIndex"]),
})
