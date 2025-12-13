import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Achievement definitions
export const ACHIEVEMENTS = [
  // ================================
  // STREAK BADGES (Reset on streak loss)
  // ================================
  {
    achievementId: "first_fast",
    title: "First Fast",
    description: "Complete your first fast",
    icon: "⭐",
    type: "streak" as const,
    rarity: "common" as const,
    category: "streak" as const,
    requirement: 1,
  },
  {
    achievementId: "streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "⚡",
    type: "streak" as const,
    rarity: "common" as const,
    category: "streak" as const,
    requirement: 7,
  },
  {
    achievementId: "fasts_10",
    title: "Dedicated",
    description: "Complete 10 fasts",
    icon: "💪",
    type: "streak" as const,
    rarity: "rare" as const,
    category: "streak" as const,
    requirement: 10,
  },
  {
    achievementId: "fasts_30",
    title: "Marathon Master",
    description: "Complete 30 fasts",
    icon: "🏃",
    type: "streak" as const,
    rarity: "rare" as const,
    category: "streak" as const,
    requirement: 30,
  },
  {
    achievementId: "hours_100",
    title: "Century Club",
    description: "Fast for 100+ hours total",
    icon: "💯",
    type: "streak" as const,
    rarity: "epic" as const,
    category: "streak" as const,
    requirement: 100,
  },
  {
    achievementId: "streak_30",
    title: "Unstoppable",
    description: "Maintain a 30-day streak",
    icon: "🔥",
    type: "streak" as const,
    rarity: "epic" as const,
    category: "streak" as const,
    requirement: 30,
  },
  {
    achievementId: "fasts_50",
    title: "Elite Faster",
    description: "Complete 50 fasts",
    icon: "👑",
    type: "streak" as const,
    rarity: "legendary" as const,
    category: "streak" as const,
    requirement: 50,
  },
  {
    achievementId: "hours_500",
    title: "Legend",
    description: "Fast for 500+ hours total",
    icon: "✨",
    type: "streak" as const,
    rarity: "legendary" as const,
    category: "streak" as const,
    requirement: 500,
  },

  // ================================
  // FITNESS ACHIEVEMENTS
  // ================================
  {
    achievementId: "gym_rat",
    title: "Gym Rat",
    description: "Maintain a 7-day Gym streak",
    icon: "🏋️‍♂️",
    type: "streak" as const,
    rarity: "rare" as const,
    category: "streak" as const,
    requirement: 7,
  },
  {
    achievementId: "iron_pumper",
    title: "Iron Pumper",
    description: "Complete 50 Gym sessions",
    icon: "💪",
    type: "streak" as const,
    rarity: "epic" as const,
    category: "consistency" as const,
    requirement: 50,
  },
  {
    achievementId: "pavement_pounder",
    title: "Pavement Pounder",
    description: "Maintain a 7-day Jogging/Walking streak",
    icon: "🏃",
    type: "streak" as const,
    rarity: "rare" as const,
    category: "streak" as const,
    requirement: 7,
  },
  {
    achievementId: "marathoner",
    title: "Marathoner",
    description: "Complete 50 Jogging/Walking sessions",
    icon: "🏅",
    type: "streak" as const,
    rarity: "epic" as const,
    category: "consistency" as const,
    requirement: 50,
  },

  // ================================
  // DIET ACHIEVEMENTS
  // ================================
  {
    achievementId: "carb_kicker",
    title: "Carb Kicker",
    description: "Maintain a 7-day Zero Carb streak",
    icon: "🥩",
    type: "streak" as const,
    rarity: "rare" as const,
    category: "streak" as const,
    requirement: 7,
  },
  {
    achievementId: "keto_king",
    title: "Keto King",
    description: "Complete 30 Zero Carb sessions",
    icon: "👑",
    type: "streak" as const,
    rarity: "epic" as const,
    category: "consistency" as const,
    requirement: 30,
  },

  // ================================
  // READING ACHIEVEMENTS
  // ================================
  {
    achievementId: "bookworm",
    title: "Bookworm",
    description: "Maintain a 7-day Reading streak",
    icon: "🐛",
    type: "streak" as const,
    rarity: "common" as const,
    category: "streak" as const,
    requirement: 7,
  },
  {
    achievementId: "scholar",
    title: "Scholar",
    description: "Complete 50 Reading sessions",
    icon: "🎓",
    type: "streak" as const,
    rarity: "rare" as const,
    category: "consistency" as const,
    requirement: 50,
  },
  {
    achievementId: "library_legend",
    title: "Library Legend",
    description: "Complete 100 Reading sessions",
    icon: "📚",
    type: "streak" as const,
    rarity: "epic" as const,
    category: "consistency" as const,
    requirement: 100,
  },

  // ================================
  // GOAL COMPLETION BADGES (Persistent)
  // ================================
  {
    achievementId: "goal_first",
    title: "Go Getter",
    description: "Complete your first goal",
    icon: "🎯",
    type: "goal" as const,
    rarity: "common" as const,
    category: "goals" as const,
    requirement: 1,
  },
  {
    achievementId: "goal_5",
    title: "Focused",
    description: "Complete 5 goals",
    icon: "💪",
    type: "goal" as const,
    rarity: "rare" as const,
    category: "goals" as const,
    requirement: 5,
  },
  {
    achievementId: "goal_10",
    title: "Unstoppable",
    description: "Complete 10 goals",
    icon: "🚀",
    type: "goal" as const,
    rarity: "epic" as const,
    category: "goals" as const,
    requirement: 10,
  },
  {
    achievementId: "goal_25",
    title: "Legend",
    description: "Complete 25 goals",
    icon: "🏆",
    type: "goal" as const,
    rarity: "legendary" as const,
    category: "goals" as const,
    requirement: 25,
  },
];

// Seed achievements (run once)
// Seed achievements (run once) - Internal mutation
export const seedAchievements = internalMutation({
  handler: async (ctx) => {
    for (const achievement of ACHIEVEMENTS) {
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_achievement_id", (q) =>
          q.eq("achievementId", achievement.achievementId)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("achievements", achievement);
      }
    }
  },
});

// Public wrapper to seed achievements (for admin/initial setup)
export const initializeAchievements = mutation({
  handler: async (ctx) => {
    let seededCount = 0;
    for (const achievement of ACHIEVEMENTS) {
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_achievement_id", (q) =>
          q.eq("achievementId", achievement.achievementId)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("achievements", achievement);
        seededCount++;
      }
    }
    return { seededCount, total: ACHIEVEMENTS.length };
  },
});

// Check if achievements need synchronization
export const checkSyncStatus = query({
  handler: async (ctx) => {
    const allAchievements = await ctx.db.query("achievements").collect();
    return allAchievements.length < ACHIEVEMENTS.length;
  },
});

// Get all achievements with user's unlock status
export const getAllWithStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const allAchievements = await ctx.db.query("achievements").collect();
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    return allAchievements.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.achievementId),
      unlockedAt: userAchievements.find(
        (ua) => ua.achievementId === achievement.achievementId
      )?.unlockedAt,
    }));
  },
});

// Get user's unlocked achievements
export const getUnlocked = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const achievements = await Promise.all(
      userAchievements.map(async (ua) => {
        const achievement = await ctx.db
          .query("achievements")
          .withIndex("by_achievement_id", (q) =>
            q.eq("achievementId", ua.achievementId)
          )
          .first();
        return achievement
          ? { ...achievement, unlockedAt: ua.unlockedAt }
          : null;
      })
    );

    return achievements.filter(Boolean);
  },
});

// Unlock an achievement
export const unlock = mutation({
  args: {
    userId: v.string(),
    achievementId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already unlocked
    const existing = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("achievementId"), args.achievementId))
      .first();

    if (existing) {
      return { alreadyUnlocked: true };
    }

    await ctx.db.insert("userAchievements", {
      userId: args.userId,
      achievementId: args.achievementId,
      unlockedAt: new Date().toISOString(),
    });

    return { unlocked: true, achievementId: args.achievementId };
  },
});

// Revoke all streak badges when user loses streak
export const revokeStreakBadges = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all streak-type achievements
    const streakAchievements = await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("type"), "streak"))
      .collect();

    const streakAchievementIds = streakAchievements.map((a) => a.achievementId);

    // Find and delete all unlocked streak badges for this user
    const userStreakBadges = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const revokedCount = [];
    for (const badge of userStreakBadges) {
      if (streakAchievementIds.includes(badge.achievementId)) {
        await ctx.db.delete(badge._id);
        revokedCount.push(badge.achievementId);
      }
    }

    return { revoked: revokedCount.length, revokedIds: revokedCount };
  },
});

// Check and unlock achievements based on current stats
export const checkAndUnlock = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("streak"),
      v.literal("goal_completed"),
      v.literal("community_joined"),
      v.literal("community_created"),
      v.literal("cheer_sent")
    ),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const newlyUnlocked: string[] = [];

    // Get achievements for this category
    let categoryToCheck: string;
    switch (args.type) {
      case "streak":
        categoryToCheck = "streak";
        break;
      case "goal_completed":
        categoryToCheck = "goals";
        break;
      case "community_joined":
      case "community_created":
      case "cheer_sent":
        categoryToCheck = "social";
        break;
      default:
        return { newlyUnlocked: [] };
    }

    const achievements = await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("category"), categoryToCheck))
      .collect();

    for (const achievement of achievements) {
      if (args.value >= achievement.requirement) {
        // Check if already unlocked
        const existing = await ctx.db
          .query("userAchievements")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .filter((q) =>
            q.eq(q.field("achievementId"), achievement.achievementId)
          )
          .first();

        if (!existing) {
          await ctx.db.insert("userAchievements", {
            userId: args.userId,
            achievementId: achievement.achievementId,
            unlockedAt: new Date().toISOString(),
          });
          newlyUnlocked.push(achievement.achievementId);
        }
      }
    }

    return { newlyUnlocked };
  },
});

// Get achievement stats
export const getStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const totalAchievements = await ctx.db.query("achievements").collect();

    const byRarity = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };

    for (const ua of userAchievements) {
      const achievement = await ctx.db
        .query("achievements")
        .withIndex("by_achievement_id", (q) =>
          q.eq("achievementId", ua.achievementId)
        )
        .first();
      if (achievement) {
        byRarity[achievement.rarity]++;
      }
    }

    return {
      unlocked: userAchievements.length,
      total: totalAchievements.length,
      byRarity,
    };
  },
});
