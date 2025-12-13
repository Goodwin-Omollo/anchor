import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get activity feed for a community
export const getByCommunity = query({
  args: {
    communityId: v.id("communities"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activityFeed")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .order("desc")
      .take(args.limit ?? 50);

    // Enrich with user info from community members
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const member = await ctx.db
          .query("communityMembers")
          .withIndex("by_user", (q) => q.eq("userId", activity.userId))
          .filter((q) => q.eq(q.field("communityId"), args.communityId))
          .first();

        // Get reactions for this activity
        const reactions = await ctx.db
          .query("encouragements")
          .filter((q) =>
            q.and(
              q.eq(q.field("activityId"), activity._id),
              q.eq(q.field("type"), "reaction")
            )
          )
          .collect();

        return {
          ...activity,
          displayName: member?.displayName ?? "Unknown",
          avatarUrl: member?.avatarUrl,
          reactions: reactions.map((r) => ({
            emoji: r.emoji,
            fromUserId: r.fromUserId,
          })),
        };
      })
    );

    return enrichedActivities;
  },
});

// Add activity to feed (called internally when habits are completed, etc.)
export const addActivity = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityFeed", {
      communityId: args.communityId,
      userId: args.userId,
      type: args.type,
      habitId: args.habitId,
      goalId: args.goalId,
      streakCount: args.streakCount,
      message: args.message,
      createdAt: new Date().toISOString(),
    });
  },
});

// React to an activity
export const reactToActivity = mutation({
  args: {
    activityId: v.id("activityFeed"),
    fromUserId: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }

    // Check if user already reacted with this emoji
    const existingReaction = await ctx.db
      .query("encouragements")
      .filter((q) =>
        q.and(
          q.eq(q.field("activityId"), args.activityId),
          q.eq(q.field("fromUserId"), args.fromUserId),
          q.eq(q.field("emoji"), args.emoji)
        )
      )
      .first();

    if (existingReaction) {
      // Remove reaction (toggle)
      await ctx.db.delete(existingReaction._id);
      return { action: "removed" };
    }

    // Add reaction
    await ctx.db.insert("encouragements", {
      fromUserId: args.fromUserId,
      toUserId: activity.userId,
      communityId: activity.communityId,
      activityId: args.activityId,
      type: "reaction",
      emoji: args.emoji,
      createdAt: new Date().toISOString(),
      read: false,
    });

    return { action: "added" };
  },
});

// Send a nudge to a friend
export const sendNudge = mutation({
  args: {
    fromUserId: v.string(),
    toUserId: v.string(),
    communityId: v.optional(v.id("communities")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already sent a nudge today
    const today = new Date().toISOString().split("T")[0];
    const existingNudge = await ctx.db
      .query("encouragements")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", args.fromUserId))
      .filter((q) =>
        q.and(
          q.eq(q.field("toUserId"), args.toUserId),
          q.eq(q.field("type"), "nudge"),
          q.gte(q.field("createdAt"), today)
        )
      )
      .first();

    if (existingNudge) {
      throw new Error("You've already nudged this person today");
    }

    await ctx.db.insert("encouragements", {
      fromUserId: args.fromUserId,
      toUserId: args.toUserId,
      communityId: args.communityId,
      type: "nudge",
      message:
        args.message ?? "Hey! Don't forget to complete your habits today! 💪",
      createdAt: new Date().toISOString(),
      read: false,
    });

    return { success: true };
  },
});

// Send a cheer
export const sendCheer = mutation({
  args: {
    fromUserId: v.string(),
    toUserId: v.string(),
    communityId: v.optional(v.id("communities")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("encouragements", {
      fromUserId: args.fromUserId,
      toUserId: args.toUserId,
      communityId: args.communityId,
      type: "cheer",
      message: args.message,
      createdAt: new Date().toISOString(),
      read: false,
    });

    return { success: true };
  },
});

// Get unread encouragements for a user
export const getUnreadEncouragements = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const encouragements = await ctx.db
      .query("encouragements")
      .withIndex("by_to_user", (q) => q.eq("toUserId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    // Get sender info
    const enriched = await Promise.all(
      encouragements.map(async (enc) => {
        // Try to get display name from any shared community
        let displayName = "A friend";
        if (enc.communityId) {
          const member = await ctx.db
            .query("communityMembers")
            .withIndex("by_user", (q) => q.eq("userId", enc.fromUserId))
            .filter((q) => q.eq(q.field("communityId"), enc.communityId))
            .first();
          if (member) {
            displayName = member.displayName;
          }
        }

        return {
          ...enc,
          fromDisplayName: displayName,
        };
      })
    );

    return enriched;
  },
});

// Mark encouragements as read
export const markAsRead = mutation({
  args: { encouragementIds: v.array(v.id("encouragements")) },
  handler: async (ctx, args) => {
    for (const id of args.encouragementIds) {
      await ctx.db.patch(id, { read: true });
    }
    return { success: true };
  },
});
