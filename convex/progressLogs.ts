import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("progressLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const listByGoal = query({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("progressLogs")
      .withIndex("by_goal", (q) => q.eq("goalId", args.goalId))
      .collect();
  },
});

export const log = mutation({
  args: {
    goalId: v.id("goals"),
    value: v.number(),
    notes: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const date = new Date().toISOString().split("T")[0];

    // Create progress log
    const logId = await ctx.db.insert("progressLogs", {
      goalId: args.goalId,
      date,
      value: args.value,
      notes: args.notes,
      userId: args.userId,
    });

    // Update goal's current value
    await ctx.db.patch(args.goalId, {
      currentValue: args.value,
    });

    return logId;
  },
});
