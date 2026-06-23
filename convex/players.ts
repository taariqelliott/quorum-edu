import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const joinRoom = mutation({
  args: { roomCode: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.roomCode))
      .unique()
    if (!room) throw new Error("Room not found")
    if (room.status !== "waiting") throw new Error("This game has already started")

    const existing = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomCode", args.roomCode))
      .take(1000)
    const duplicate = existing.find((p) => p.name === args.name)
    if (duplicate) throw new Error("Name already taken")

    await ctx.db.insert("players", {
      roomCode: args.roomCode,
      name: args.name,
      joinedAt: Date.now(),
    })
  },
})

export const getPlayers = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomCode", args.roomCode))
      .take(500)
  },
})
