import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    type: v.union(v.literal("weight-loss"), v.literal("reading")),
    title: v.string(),

    // Weight Loss fields
    currentWeight: v.optional(v.number()),
    targetWeightLoss: v.optional(v.number()),

    // Reading fields
    targetBooks: v.optional(v.number()),
    booksRead: v.optional(v.number()),

    // Common fields
    targetValue: v.number(),
    unit: v.string(),
    deadline: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const startDate = new Date().toISOString().split("T")[0];
    const deadlineDate = new Date(args.deadline);
    const startDateObj = new Date(startDate);

    // Calculate duration in weeks
    const durationMs = deadlineDate.getTime() - startDateObj.getTime();
    const durationDays = durationMs / (1000 * 60 * 60 * 24);
    const durationWeeks = Math.ceil(durationDays / 7);

    // Enforce minimum 12 weeks
    if (durationWeeks < 12) {
      throw new Error(
        "Goal duration must be at least 12 weeks (84 days). Please choose a deadline at least 3 months from today."
      );
    }

    const goalId = await ctx.db.insert("goals", {
      type: args.type,
      title: args.title,
      currentWeight: args.currentWeight,
      targetWeightLoss: args.targetWeightLoss,
      targetBooks: args.targetBooks,
      booksRead: args.booksRead,
      targetValue: args.targetValue,
      currentValue: 0,
      unit: args.unit,
      startDate,
      deadline: args.deadline,
      durationWeeks,
      userId: args.userId,
    });

    // Create baseline snapshot (week 0)
    const endOfWeek = new Date(startDateObj);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    await ctx.db.insert("weeklyProgress", {
      goalId,
      weekNumber: 0,
      snapshotDate: startDate,
      weekStartDate: startDate,
      weekEndDate: endOfWeek.toISOString().split("T")[0],
      weightValue: args.currentWeight,
      booksCompleted: args.booksRead || 0,
      habitsCompletedCount: 0,
      totalHabitsAvailable: 0,
      completionRate: 0,
      hasProgress: false, // Baseline has no previous week to compare
      progressDelta: 0,
      userId: args.userId,
    });

    return goalId;
  },
});

export const update = mutation({
  args: {
    id: v.id("goals"),
    title: v.optional(v.string()),

    // Weight Loss fields
    currentWeight: v.optional(v.number()),
    targetWeightLoss: v.optional(v.number()),

    // Reading fields
    targetBooks: v.optional(v.number()),
    booksRead: v.optional(v.number()),

    // Common fields
    targetValue: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    unit: v.optional(v.string()),
    deadline: v.optional(v.string()),
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
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    // Delete habits associated with this goal
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_goal", (q) => q.eq("goalId", args.id))
      .collect();

    for (const habit of habits) {
      // Delete habit logs for each habit
      const habitLogs = await ctx.db
        .query("habitLogs")
        .withIndex("by_habit", (q) => q.eq("habitId", habit._id))
        .collect();

      for (const log of habitLogs) {
        await ctx.db.delete(log._id);
      }

      await ctx.db.delete(habit._id);
    }

    // Delete progress logs for this goal
    const progressLogs = await ctx.db
      .query("progressLogs")
      .withIndex("by_goal", (q) => q.eq("goalId", args.id))
      .collect();

    for (const log of progressLogs) {
      await ctx.db.delete(log._id);
    }

    await ctx.db.delete(args.id);
  },
});
