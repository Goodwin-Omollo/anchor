import { v } from "convex/values";
import { query } from "./_generated/server";

// Get leaderboard for a community
export const getCommunityLeaderboard = query({
  args: {
    communityId: v.id("communities"),
    type: v.optional(
      v.union(
        v.literal("streak"),
        v.literal("completion"),
        v.literal("activity")
      )
    ),
  },
  handler: async (ctx, args) => {
    const type = args.type ?? "streak";

    // Get all members
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    // Calculate scores for each member
    const leaderboard = await Promise.all(
      members.map(async (member) => {
        let score = 0;
        let details = "";

        if (type === "streak") {
          // Get user's habits and calculate total streak
          const habits = await ctx.db
            .query("habits")
            .withIndex("by_user", (q) => q.eq("userId", member.userId))
            .collect();

          const logs = await ctx.db
            .query("habitLogs")
            .withIndex("by_user", (q) => q.eq("userId", member.userId))
            .collect();

          // Calculate best streak across all habits
          let bestStreak = 0;
          for (const habit of habits) {
            const habitLogs = logs
              .filter((l) => l.habitId === habit._id)
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );

            let streak = 0;
            for (const log of habitLogs) {
              if (log.completed) {
                streak++;
              } else {
                break;
              }
            }
            bestStreak = Math.max(bestStreak, streak);
          }
          score = bestStreak;
          details = `${score} days`;
        } else if (type === "completion") {
          // Calculate weekly completion rate
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const weekAgoStr = weekAgo.toISOString().split("T")[0];

          const logs = await ctx.db
            .query("habitLogs")
            .withIndex("by_user", (q) => q.eq("userId", member.userId))
            .filter((q) => q.gte(q.field("date"), weekAgoStr))
            .collect();

          const completed = logs.filter((l) => l.completed).length;
          const total = logs.length || 1;
          score = Math.round((completed / total) * 100);
          details = `${score}%`;
        } else if (type === "activity") {
          // Count activities in the last week
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);

          const activities = await ctx.db
            .query("activityFeed")
            .withIndex("by_user", (q) => q.eq("userId", member.userId))
            .filter((q) =>
              q.and(
                q.eq(q.field("communityId"), args.communityId),
                q.gte(q.field("createdAt"), weekAgo.toISOString())
              )
            )
            .collect();

          score = activities.length;
          details = `${score} activities`;
        }

        return {
          userId: member.userId,
          displayName: member.displayName,
          avatarUrl: member.avatarUrl,
          score,
          details,
          role: member.role,
        };
      })
    );

    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);

    // Add rank
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },
});

// Get user's rank in community
export const getUserRank = query({
  args: {
    communityId: v.id("communities"),
    userId: v.string(),
    type: v.optional(
      v.union(
        v.literal("streak"),
        v.literal("completion"),
        v.literal("activity")
      )
    ),
  },
  handler: async (ctx, args) => {
    // This would call getCommunityLeaderboard internally
    // For now, we'll compute directly
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    // Simplified: just find position
    const userMember = members.find((m) => m.userId === args.userId);
    if (!userMember) return null;

    return {
      rank: 1, // Placeholder - would need full calculation
      total: members.length,
    };
  },
});

// Get global stats summary
export const getGlobalStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get user's communities
    const memberships = await ctx.db
      .query("communityMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get user's habits
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get all habit logs
    const logs = await ctx.db
      .query("habitLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Calculate best streak
    let bestStreak = 0;
    for (const habit of habits) {
      const habitLogs = logs
        .filter((l) => l.habitId === habit._id)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      let streak = 0;
      for (const log of habitLogs) {
        if (log.completed) {
          streak++;
        } else {
          break;
        }
      }
      bestStreak = Math.max(bestStreak, streak);
    }

    // Get completed goals
    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const completedGoals = goals.filter(
      (g) => g.currentValue >= g.targetValue
    ).length;

    // Get achievements
    const achievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      communitiesJoined: memberships.length,
      totalHabits: habits.length,
      bestStreak,
      totalCompletions: logs.filter((l) => l.completed).length,
      goalsCompleted: completedGoals,
      achievementsUnlocked: achievements.length,
    };
  },
});
