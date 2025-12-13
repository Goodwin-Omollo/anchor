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

    let logId;
    if (existingLog) {
      // Update existing log
      await ctx.db.patch(existingLog._id, {
        completed: args.completed,
        notes: args.notes,
      });
      logId = existingLog._id;
    } else {
      // Create new log
      logId = await ctx.db.insert("habitLogs", {
        habitId: args.habitId,
        date: args.date,
        completed: args.completed,
        notes: args.notes,
        userId: args.userId,
      });
    }

    // If this is a completion, calculate streak and post to activity feed
    if (args.completed) {
      const habit = await ctx.db.get(args.habitId);
      if (habit) {
        // Calculate current streak
        const logs = await ctx.db
          .query("habitLogs")
          .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
          .collect();

        const sortedLogs = logs
          .filter((l) => l.completed)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        let streak = 0;
        const today = new Date();
        let currentDate = new Date(today);
        currentDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
          const dateStr = currentDate.toISOString().split("T")[0];
          const log = sortedLogs.find((l) => l.date === dateStr);

          if (log) {
            streak++;
          } else if (dateStr !== today.toISOString().split("T")[0]) {
            break;
          }

          currentDate.setDate(currentDate.getDate() - 1);
        }

        // Update habit with current streak
        const previousStreak = habit.currentStreak ?? 0;
        const longestStreak = Math.max(habit.longestStreak ?? 0, streak);

        await ctx.db.patch(args.habitId, {
          currentStreak: streak,
          longestStreak,
        });

        // Check for streak milestones
        const milestones = [7, 14, 30, 60, 90, 100, 180, 365];
        const reachedMilestone = milestones.find(
          (m) => streak >= m && previousStreak < m
        );

        // Get user's communities to post activities
        const memberships = await ctx.db
          .query("communityMembers")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .collect();

        // Post to each community
        for (const membership of memberships) {
          const community = await ctx.db.get(membership.communityId);
          if (!community) continue;

          // Skip if community has a different goal type than habit's goal
          if (community.goalType) {
            const goal = await ctx.db.get(habit.goalId);
            if (goal && goal.type !== community.goalType) continue;
          }

          if (reachedMilestone) {
            // Post milestone achievement
            await ctx.db.insert("activityFeed", {
              communityId: membership.communityId,
              userId: args.userId,
              type: "streak_milestone",
              habitId: args.habitId,
              streakCount: reachedMilestone,
              message: `Reached a ${reachedMilestone}-day streak on ${habit.name}! 🔥`,
              createdAt: new Date().toISOString(),
            });
          } else if (streak >= 3) {
            // Only post regular completions for streaks 3+
            await ctx.db.insert("activityFeed", {
              communityId: membership.communityId,
              userId: args.userId,
              type: "habit_completed",
              habitId: args.habitId,
              streakCount: streak,
              message: `Completed ${habit.name} (${streak} day streak)`,
              createdAt: new Date().toISOString(),
            });
          }
        }

        // Check and unlock streak achievements
        if (streak >= 7) {
          const achievementId = `streak_${streak >= 365 ? 365 : streak >= 100 ? 100 : streak >= 30 ? 30 : 7}`;
          const existing = await ctx.db
            .query("userAchievements")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("achievementId"), achievementId))
            .first();

          if (!existing) {
            await ctx.db.insert("userAchievements", {
              userId: args.userId,
              achievementId,
              unlockedAt: new Date().toISOString(),
            });
          }
        }

        // Check for specific habit template achievements
        if (habit.templateId) {
          const templateId = habit.templateId;
          const achievementsToUnlock: string[] = [];

          // Fitness Achievements
          if (templateId === "gym") {
            if (streak >= 7) achievementsToUnlock.push("gym_rat");
            // Check total completions for iron_pumper
            if (sortedLogs.length >= 50)
              achievementsToUnlock.push("iron_pumper");
          }

          if (templateId === "jogging" || templateId === "walking") {
            if (streak >= 7) achievementsToUnlock.push("pavement_pounder");
            if (sortedLogs.length >= 50)
              achievementsToUnlock.push("marathoner");
          }

          // Diet Achievements
          if (templateId === "moran") {
            // Zero Carb
            if (streak >= 7) achievementsToUnlock.push("carb_kicker");
            if (sortedLogs.length >= 30) achievementsToUnlock.push("keto_king");
          }

          // Reading Achievements
          if (
            templateId === "daily-reading" ||
            templateId === "morning-reading" ||
            templateId === "bedtime-reading"
          ) {
            if (streak >= 7) achievementsToUnlock.push("bookworm");
            if (sortedLogs.length >= 50) achievementsToUnlock.push("scholar");
            if (sortedLogs.length >= 100)
              achievementsToUnlock.push("library_legend");
          }

          // Unlock any earned achievements
          for (const achievementId of achievementsToUnlock) {
            const existing = await ctx.db
              .query("userAchievements")
              .withIndex("by_user", (q) => q.eq("userId", args.userId))
              .filter((q) => q.eq(q.field("achievementId"), achievementId))
              .first();

            if (!existing) {
              await ctx.db.insert("userAchievements", {
                userId: args.userId,
                achievementId,
                unlockedAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    }

    return logId;
  },
});
