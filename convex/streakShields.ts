import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Use a streak shield to protect a habit's streak
export const useShield = mutation({
  args: {
    userId: v.string(),
    habitId: v.id("habits"),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Check if user has already used a shield this week
    const recentShields = await ctx.db
      .query("streakShields")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("usedAt"), weekAgo.toISOString()))
      .collect();

    if (recentShields.length > 0) {
      throw new Error("You can only use one streak shield per week");
    }

    // Create the shield
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    await ctx.db.insert("streakShields", {
      userId: args.userId,
      habitId: args.habitId,
      usedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    return { success: true, expiresAt: expiresAt.toISOString() };
  },
});

// Check if a habit has an active shield
export const hasActiveShield = query({
  args: {
    userId: v.string(),
    habitId: v.id("habits"),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    const activeShield = await ctx.db
      .query("streakShields")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.gt(q.field("expiresAt"), now)
        )
      )
      .first();

    return !!activeShield;
  },
});

// Check if user can use a shield this week
export const canUseShield = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentShields = await ctx.db
      .query("streakShields")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("usedAt"), weekAgo.toISOString()))
      .collect();

    const nextAvailable =
      recentShields.length > 0
        ? new Date(
            new Date(recentShields[0].usedAt).getTime() +
              7 * 24 * 60 * 60 * 1000
          )
        : null;

    return {
      canUse: recentShields.length === 0,
      nextAvailable: nextAvailable?.toISOString() ?? null,
    };
  },
});

// Get user's streak shield history
export const getHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const shields = await ctx.db
      .query("streakShields")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);

    return shields;
  },
});

// Calculate streak for a habit (considering shields)
export const calculateStreak = query({
  args: {
    habitId: v.id("habits"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all logs for this habit sorted by date descending
    const logs = await ctx.db
      .query("habitLogs")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .order("desc")
      .collect();

    // Get shields for this habit
    const shields = await ctx.db
      .query("streakShields")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .collect();

    const shieldDates = new Set(shields.map((s) => s.usedAt.split("T")[0]));

    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toISOString().split("T")[0];

      // Check if there's a completed log for this date
      const log = logs.find((l) => l.date === dateStr && l.completed);

      // Check if there's a shield for this date
      const hasShield = shieldDates.has(dateStr);

      if (log || hasShield) {
        streak++;
      } else if (dateStr !== today.toISOString().split("T")[0]) {
        // Break streak if no log and no shield (unless it's today)
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return { streak };
  },
});

// Get streak milestones
export const getMilestones = query({
  args: { currentStreak: v.number() },
  handler: async (_, args) => {
    const milestones = [7, 14, 30, 60, 90, 100, 180, 365];
    const nextMilestone =
      milestones.find((m) => m > args.currentStreak) ?? null;
    const reachedMilestones = milestones.filter((m) => m <= args.currentStreak);

    return {
      current: args.currentStreak,
      next: nextMilestone,
      daysToNext: nextMilestone ? nextMilestone - args.currentStreak : null,
      reached: reachedMilestones,
    };
  },
});
