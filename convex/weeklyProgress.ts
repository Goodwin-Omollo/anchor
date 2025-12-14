import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

/**
 * Capture weekly progress snapshot for all active goals
 * This should be triggered every Sunday by a cron job
 */
export const captureWeeklySnapshot = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Get all active goals (not past deadline)
    const allGoals = await ctx.db.query("goals").collect();
    const activeGoals = allGoals.filter((goal) => {
      const deadline = new Date(goal.deadline);
      return deadline >= today;
    });

    for (const goal of activeGoals) {
      const goalStartDate = new Date(goal.startDate || todayStr);

      // Calculate which week we're in
      const daysSinceStart = Math.floor(
        (today.getTime() - goalStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const weekNumber = Math.floor(daysSinceStart / 7) + 1; // Week 1, 2, 3...

      // Check if we already have a snapshot for this week
      const existingSnapshot = await ctx.db
        .query("weeklyProgress")
        .withIndex("by_week", (q) =>
          q.eq("goalId", goal._id).eq("weekNumber", weekNumber)
        )
        .first();

      if (existingSnapshot) {
        console.log(
          `Snapshot for goal ${goal._id} week ${weekNumber} already exists`
        );
        continue;
      }

      // Calculate week start (last Sunday) and end (this Saturday)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Last Sunday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // This Saturday

      // Get habits for this goal
      const habits = await ctx.db
        .query("habits")
        .withIndex("by_goal", (q) => q.eq("goalId", goal._id))
        .collect();

      // Calculate habit completion for this week
      let habitsCompletedCount = 0;
      let totalHabitsAvailable = 0;

      const weekStartStr = weekStart.toISOString().split("T")[0];
      const weekEndStr = weekEnd.toISOString().split("T")[0];

      for (const habit of habits) {
        // Count days in the week this habit should be completed
        const daysInWeek = 7;
        totalHabitsAvailable += daysInWeek; // Simplified: assumes daily habits

        // Count completed logs for this week
        const logs = await ctx.db
          .query("habitLogs")
          .withIndex("by_habit", (q) => q.eq("habitId", habit._id))
          .collect();

        const weekLogs = logs.filter((log) => {
          return log.date >= weekStartStr && log.date <= weekEndStr;
        });

        habitsCompletedCount += weekLogs.filter((log) => log.completed).length;
      }

      const completionRate =
        totalHabitsAvailable > 0
          ? (habitsCompletedCount / totalHabitsAvailable) * 100
          : 0;

      // Get goal-specific metric
      let weightValue: number | undefined;
      let booksCompleted: number | undefined;

      if (goal.type === "weight-loss") {
        // Get most recent weight from progressLogs
        const latestWeightLog = await ctx.db
          .query("progressLogs")
          .withIndex("by_goal", (q) => q.eq("goalId", goal._id))
          .order("desc")
          .first();

        weightValue = latestWeightLog?.value ?? goal.currentWeight;
      } else if (goal.type === "reading") {
        booksCompleted = goal.booksRead ?? 0;
      }

      // Get previous week's snapshot to check progress
      const previousSnapshot = await ctx.db
        .query("weeklyProgress")
        .withIndex("by_week", (q) =>
          q.eq("goalId", goal._id).eq("weekNumber", weekNumber - 1)
        )
        .first();

      let hasProgress = false;
      let progressDelta: number | undefined;

      if (previousSnapshot) {
        if (goal.type === "weight-loss" && weightValue !== undefined) {
          // Progress = weight went down
          const previousWeight = previousSnapshot.weightValue ?? 0;
          hasProgress = weightValue < previousWeight;
          progressDelta = previousWeight - weightValue; // Positive = weight loss
        } else if (goal.type === "reading" && booksCompleted !== undefined) {
          // Progress = more books read
          const previousBooks = previousSnapshot.booksCompleted ?? 0;
          hasProgress = booksCompleted > previousBooks;
          progressDelta = booksCompleted - previousBooks;
        }
      }

      // Create the weekly snapshot
      await ctx.db.insert("weeklyProgress", {
        goalId: goal._id,
        weekNumber,
        snapshotDate: todayStr,
        weekStartDate: weekStartStr,
        weekEndDate: weekEndStr,
        weightValue,
        booksCompleted,
        habitsCompletedCount,
        totalHabitsAvailable,
        completionRate,
        hasProgress,
        progressDelta,
        userId: goal.userId,
      });
    }

    return { processed: activeGoals.length };
  },
});

/**
 * Get progress timeline for a goal
 */
export const getProgressTimeline = query({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query("weeklyProgress")
      .withIndex("by_goal", (q) => q.eq("goalId", args.goalId))
      .order("asc")
      .collect();

    return snapshots;
  },
});

/**
 * Get current week's progress (real-time, before Sunday snapshot)
 */
export const getCurrentWeekProgress = query({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    if (!goal) return null;

    const today = new Date();
    const goalStartDate = new Date(goal.startDate || today.toISOString());

    // Calculate current week number
    const daysSinceStart = Math.floor(
      (today.getTime() - goalStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentWeekNumber = Math.floor(daysSinceStart / 7) + 1;

    // Calculate current week start (last Sunday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];

    // Get habits for this goal
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_goal", (q) => q.eq("goalId", args.goalId))
      .collect();

    // Calculate habit completion for current week so far
    let habitsCompletedCount = 0;
    let totalHabitsAvailable = 0;

    const daysSinceWeekStart = today.getDay(); // 0-6 (Sun-Sat)
    const daysElapsed = daysSinceWeekStart === 0 ? 7 : daysSinceWeekStart;

    for (const habit of habits) {
      totalHabitsAvailable += daysElapsed;

      const logs = await ctx.db
        .query("habitLogs")
        .withIndex("by_habit", (q) => q.eq("habitId", habit._id))
        .collect();

      const weekLogs = logs.filter((log) => {
        return log.date >= weekStartStr && log.date <= todayStr;
      });

      habitsCompletedCount += weekLogs.filter((log) => log.completed).length;
    }

    const completionRate =
      totalHabitsAvailable > 0
        ? (habitsCompletedCount / totalHabitsAvailable) * 100
        : 0;

    // Get current metric value
    let currentMetric: number | undefined;
    if (goal.type === "weight-loss") {
      const latestWeightLog = await ctx.db
        .query("progressLogs")
        .withIndex("by_goal", (q) => q.eq("goalId", args.goalId))
        .order("desc")
        .first();
      currentMetric = latestWeightLog?.value ?? goal.currentWeight;
    } else if (goal.type === "reading") {
      currentMetric = goal.booksRead ?? 0;
    }

    return {
      weekNumber: currentWeekNumber,
      habitsCompletedCount,
      totalHabitsAvailable,
      completionRate,
      currentMetric,
    };
  },
});

/**
 * Check if a weekly log exists for the current week
 */
export const getWeeklyLogStatus = query({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    if (!goal) return null;

    const today = new Date();
    const goalStartDate = new Date(goal.startDate || today.toISOString());

    // Calculate current week number
    const daysSinceStart = Math.floor(
      (today.getTime() - goalStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentWeekNumber = Math.max(1, Math.floor(daysSinceStart / 7) + 1);

    const existingSnapshot = await ctx.db
      .query("weeklyProgress")
      .withIndex("by_week", (q) =>
        q.eq("goalId", args.goalId).eq("weekNumber", currentWeekNumber)
      )
      .first();

    return {
      hasLogged: !!existingSnapshot,
      weekNumber: currentWeekNumber,
    };
  },
});
