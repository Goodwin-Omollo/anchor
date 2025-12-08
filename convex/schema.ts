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
    deadline: v.string(),
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
});
