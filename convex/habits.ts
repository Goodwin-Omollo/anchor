import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("flexible")
    ),
    goalId: v.id("goals"), // Now required
    templateId: v.string(), // Template reference
    color: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("habits", {
      name: args.name,
      description: args.description,
      frequency: args.frequency,
      goalId: args.goalId,
      templateId: args.templateId,
      color: args.color,
      userId: args.userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("habits"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    frequency: v.optional(
      v.union(v.literal("daily"), v.literal("weekly"), v.literal("flexible"))
    ),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    // Delete habit logs for this habit
    const habitLogs = await ctx.db
      .query("habitLogs")
      .withIndex("by_habit", (q) => q.eq("habitId", args.id))
      .collect();

    for (const log of habitLogs) {
      await ctx.db.delete(log._id);
    }

    await ctx.db.delete(args.id);
  },
});
