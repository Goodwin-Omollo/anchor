import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  goals: defineTable({
    type: v.union(v.literal("weight-loss"), v.literal("reading")),
    title: v.string(),

    // Weight Loss specific fields
    currentWeight: v.optional(v.number()),
    targetWeightLoss: v.optional(v.number()),

    // Reading specific fields
    targetBooks: v.optional(v.number()),
    booksRead: v.optional(v.number()),

    // Common fields
    targetValue: v.number(),
    currentValue: v.number(),
    unit: v.string(),
    startDate: v.optional(v.string()), // When the goal was started (optional for existing goals)
    deadline: v.string(),
    durationWeeks: v.optional(v.number()), // Duration in weeks (minimum 12, optional for existing goals)
    userId: v.string(),
  }).index("by_user", ["userId"]),

  habits: defineTable({
    name: v.string(),
    description: v.string(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("flexible")
    ),
    goalId: v.id("goals"), // Now required
    templateId: v.string(), // Reference to habit template
    color: v.string(),
    userId: v.string(),
    // Enhanced streak tracking
    longestStreak: v.optional(v.number()),
    currentStreak: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_goal", ["goalId"]),

  habitLogs: defineTable({
    habitId: v.id("habits"),
    date: v.string(),
    completed: v.boolean(),
    notes: v.optional(v.string()),
    userId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_habit", ["habitId"])
    .index("by_habit_and_date", ["habitId", "date"]),

  progressLogs: defineTable({
    goalId: v.id("goals"),
    date: v.string(),
    value: v.number(),
    notes: v.optional(v.string()),
    userId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_goal", ["goalId"]),

  // Weekly progress snapshots (baseline + weekly Sunday snapshots)
  weeklyProgress: defineTable({
    goalId: v.id("goals"),
    weekNumber: v.number(), // Week 0 (baseline), 1, 2, 3, etc.
    snapshotDate: v.string(), // Date snapshot was taken
    weekStartDate: v.string(), // Start of this week period
    weekEndDate: v.string(), // End of this week period

    // Goal-specific metrics (what we measure for progress)
    weightValue: v.optional(v.number()), // Current weight for weight-loss
    booksCompleted: v.optional(v.number()), // Books read count for reading

    // Habit completion metrics for the week
    habitsCompletedCount: v.number(), // Total habits completed this week
    totalHabitsAvailable: v.number(), // Total habit opportunities
    completionRate: v.number(), // Percentage

    // Progress indicators (compared to previous week)
    hasProgress: v.boolean(), // Did metric improve? (weight down, books up)
    progressDelta: v.optional(v.number()), // Change from last week
    progressNotes: v.optional(v.string()),

    userId: v.string(),
  })
    .index("by_goal", ["goalId"])
    .index("by_user", ["userId"])
    .index("by_week", ["goalId", "weekNumber"]),

  // ================================
  // SOCIAL FEATURES
  // ================================

  // Streak shields - protect streaks once per week
  streakShields: defineTable({
    userId: v.string(),
    habitId: v.id("habits"),
    usedAt: v.string(),
    expiresAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_habit", ["habitId"]),

  // Communities / Accountability Groups
  communities: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    inviteCode: v.string(),
    createdBy: v.string(),
    goalType: v.optional(
      v.union(v.literal("weight-loss"), v.literal("reading"))
    ),
    maxMembers: v.number(),
    imageUrl: v.optional(v.string()),
  })
    .index("by_creator", ["createdBy"])
    .index("by_invite_code", ["inviteCode"]),

  communityMembers: defineTable({
    communityId: v.id("communities"),
    userId: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    joinedAt: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
  })
    .index("by_community", ["communityId"])
    .index("by_user", ["userId"]),

  // Activity feed for social features
  activityFeed: defineTable({
    communityId: v.id("communities"),
    userId: v.string(),
    type: v.union(
      v.literal("habit_completed"),
      v.literal("streak_milestone"),
      v.literal("goal_achieved"),
      v.literal("member_joined"),
      v.literal("streak_shield_used")
    ),
    habitId: v.optional(v.id("habits")),
    goalId: v.optional(v.id("goals")),
    streakCount: v.optional(v.number()),
    message: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_community", ["communityId"])
    .index("by_user", ["userId"]),

  // Encouragements - nudges, cheers, reactions
  encouragements: defineTable({
    fromUserId: v.string(),
    toUserId: v.string(),
    communityId: v.optional(v.id("communities")),
    activityId: v.optional(v.id("activityFeed")),
    type: v.union(
      v.literal("nudge"),
      v.literal("cheer"),
      v.literal("reaction")
    ),
    message: v.optional(v.string()),
    emoji: v.optional(v.string()),
    createdAt: v.string(),
    read: v.boolean(),
  })
    .index("by_to_user", ["toUserId"])
    .index("by_from_user", ["fromUserId"]),

  // Achievements definitions (seeded data)
  achievements: defineTable({
    achievementId: v.string(), // e.g., "streak_7", "goal_first"
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    type: v.union(
      v.literal("streak"), // Badges that reset on streak loss
      v.literal("goal") // Badges that persist on goal completion
    ),
    rarity: v.union(
      v.literal("common"),
      v.literal("rare"),
      v.literal("epic"),
      v.literal("legendary")
    ),
    category: v.union(
      v.literal("streak"),
      v.literal("consistency"),
      v.literal("social"),
      v.literal("goals")
    ),
    requirement: v.number(), // e.g., 7 for "7-day streak"
  }).index("by_achievement_id", ["achievementId"]),

  // User unlocked achievements
  userAchievements: defineTable({
    userId: v.string(),
    achievementId: v.string(),
    unlockedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_achievement", ["achievementId"]),

  // Challenges (time-limited events)
  challenges: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("personal"),
      v.literal("community"),
      v.literal("global")
    ),
    communityId: v.optional(v.id("communities")),
    createdBy: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    targetValue: v.number(),
    targetType: v.union(
      v.literal("habit_completions"),
      v.literal("streak_days"),
      v.literal("goal_progress")
    ),
    reward: v.optional(v.string()),
  })
    .index("by_community", ["communityId"])
    .index("by_creator", ["createdBy"]),

  challengeParticipants: defineTable({
    challengeId: v.id("challenges"),
    userId: v.string(),
    progress: v.number(),
    joinedAt: v.string(),
    completed: v.boolean(),
  })
    .index("by_challenge", ["challengeId"])
    .index("by_user", ["userId"]),
});
