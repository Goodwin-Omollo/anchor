import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Create a goal with its associated habits in one transaction
export const createWithHabits = mutation({
  args: {
    goal: v.object({
      type: v.union(v.literal("weight-loss"), v.literal("reading")),
      title: v.string(),
      currentWeight: v.optional(v.number()),
      targetWeightLoss: v.optional(v.number()),
      targetBooks: v.optional(v.number()),
      booksRead: v.optional(v.number()),
      targetValue: v.number(),
      unit: v.string(),
      deadline: v.string(),
      userId: v.string(),
    }),
    habits: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        frequency: v.union(
          v.literal("daily"),
          v.literal("weekly"),
          v.literal("flexible")
        ),
        templateId: v.string(),
        color: v.string(),
        userId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Create the goal first
    const goalId = await ctx.db.insert("goals", {
      type: args.goal.type,
      title: args.goal.title,
      currentWeight: args.goal.currentWeight,
      targetWeightLoss: args.goal.targetWeightLoss,
      targetBooks: args.goal.targetBooks,
      booksRead: args.goal.booksRead,
      targetValue: args.goal.targetValue,
      currentValue: 0,
      unit: args.goal.unit,
      deadline: args.goal.deadline,
      userId: args.goal.userId,
    });

    // Create all habits associated with this goal
    const habitIds = await Promise.all(
      args.habits.map((habit) =>
        ctx.db.insert("habits", {
          name: habit.name,
          description: habit.description,
          frequency: habit.frequency,
          goalId,
          templateId: habit.templateId,
          color: habit.color,
          userId: habit.userId,
        })
      )
    );

    return { goalId, habitIds };
  },
});
