import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habitLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const log = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.string(),
    completed: v.boolean(),
    notes: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if a log already exists for this habit and date
    const existingLog = await ctx.db
      .query("habitLogs")
      .withIndex("by_habit_and_date", (q) =>
        q.eq("habitId", args.habitId).eq("date", args.date)
      )
      .first();

    if (existingLog) {
      // Update existing log
      await ctx.db.patch(existingLog._id, {
        completed: args.completed,
        notes: args.notes,
      });
      return existingLog._id;
    } else {
      // Create new log
      return await ctx.db.insert("habitLogs", {
        habitId: args.habitId,
        date: args.date,
        completed: args.completed,
        notes: args.notes,
        userId: args.userId,
      });
    }
  },
});
