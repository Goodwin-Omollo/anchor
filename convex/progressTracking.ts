import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Manually log weekly progress for a goal
 * User enters their current weight or books read count
 */
export const logWeeklyProgress = mutation({
  args: {
    goalId: v.id("goals"),
    weightValue: v.optional(v.number()),
    booksCompleted: v.optional(v.number()),
    notes: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    if (!goal) throw new Error("Goal not found");

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const goalStartDate = new Date(goal.startDate || todayStr);

    // Calculate which week we're in
    const daysSinceStart = Math.floor(
      (today.getTime() - goalStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weekNumber = Math.max(1, Math.floor(daysSinceStart / 7) + 1);

    // Check if we already have a snapshot for this week
    const existingSnapshot = await ctx.db
      .query("weeklyProgress")
      .withIndex("by_week", (q) =>
        q.eq("goalId", args.goalId).eq("weekNumber", weekNumber)
      )
      .first();

    // Calculate week boundaries
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Last Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    // Get habits for completion rate
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_goal", (q) => q.eq("goalId", args.goalId))
      .collect();

    let habitsCompletedCount = 0;
    let totalHabitsAvailable = 0;

    for (const habit of habits) {
      const daysInWeek = 7;
      totalHabitsAvailable += daysInWeek;

      const logs = await ctx.db
        .query("habitLogs")
        .withIndex("by_habit", (q) => q.eq("habitId", habit._id))
        .collect();

      const weekLogs = logs.filter(
        (log) => log.date >= weekStartStr && log.date <= weekEndStr
      );
      habitsCompletedCount += weekLogs.filter((log) => log.completed).length;
    }

    const completionRate =
      totalHabitsAvailable > 0
        ? (habitsCompletedCount / totalHabitsAvailable) * 100
        : 0;

    // Get previous week to calculate progress
    const previousSnapshot = await ctx.db
      .query("weeklyProgress")
      .withIndex("by_week", (q) =>
        q.eq("goalId", args.goalId).eq("weekNumber", weekNumber - 1)
      )
      .first();

    let hasProgress = false;
    let progressDelta: number | undefined;

    if (previousSnapshot) {
      if (goal.type === "weight-loss" && args.weightValue !== undefined) {
        const previousWeight = previousSnapshot.weightValue ?? 0;
        hasProgress = args.weightValue < previousWeight;
        progressDelta = previousWeight - args.weightValue;
      } else if (goal.type === "reading" && args.booksCompleted !== undefined) {
        const previousBooks = previousSnapshot.booksCompleted ?? 0;
        hasProgress = args.booksCompleted > previousBooks;
        progressDelta = args.booksCompleted - previousBooks;
      }
    }

    const progressData = {
      goalId: args.goalId,
      weekNumber,
      snapshotDate: todayStr,
      weekStartDate: weekStartStr,
      weekEndDate: weekEndStr,
      weightValue: args.weightValue,
      booksCompleted: args.booksCompleted,
      habitsCompletedCount,
      totalHabitsAvailable,
      completionRate,
      hasProgress,
      progressDelta,
      progressNotes: args.notes,
      userId: args.userId,
    };

    if (existingSnapshot) {
      // Update existing snapshot
      await ctx.db.patch(existingSnapshot._id, progressData);
      return existingSnapshot._id;
    } else {
      // Create new snapshot
      return await ctx.db.insert("weeklyProgress", progressData);
    }
  },
});
