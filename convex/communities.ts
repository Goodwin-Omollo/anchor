import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a random invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new community
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    goalType: v.optional(
      v.union(v.literal("weight-loss"), v.literal("reading"))
    ),
    maxMembers: v.optional(v.number()),
    userId: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user has any goals
    const userGoals = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (userGoals.length === 0) {
      throw new Error("You must have at least one goal to create a community");
    }

    // If a specific goal type is selected, ensure user has that goal
    if (args.goalType) {
      const hasMatchingGoal = userGoals.some((g) => g.type === args.goalType);
      if (!hasMatchingGoal) {
        throw new Error(
          `You must have a ${args.goalType.replace("-", " ")} goal to create this community`
        );
      }
    }

    const inviteCode = generateInviteCode();

    // Create the community
    const communityId = await ctx.db.insert("communities", {
      name: args.name,
      description: args.description,
      inviteCode,
      createdBy: args.userId,
      goalType: args.goalType,
      maxMembers: args.maxMembers ?? 10,
    });

    // Add creator as admin member
    await ctx.db.insert("communityMembers", {
      communityId,
      userId: args.userId,
      displayName: args.displayName,
      avatarUrl: args.avatarUrl,
      joinedAt: new Date().toISOString(),
      role: "admin",
    });

    return { communityId, inviteCode };
  },
});

// Join a community via invite code
export const join = mutation({
  args: {
    inviteCode: v.string(),
    userId: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user has any goals
    const userGoals = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (userGoals.length === 0) {
      throw new Error("You must have at least one goal to join a community");
    }

    // Find community by invite code
    const community = await ctx.db
      .query("communities")
      .withIndex("by_invite_code", (q) =>
        q.eq("inviteCode", args.inviteCode.toUpperCase())
      )
      .first();

    if (!community) {
      throw new Error("Invalid invite code");
    }

    // Check if community has a specific goal type and if user matches it
    if (community.goalType) {
      const hasMatchingGoal = userGoals.some(
        (g) => g.type === community.goalType
      );
      if (!hasMatchingGoal) {
        throw new Error(
          `This community is for ${community.goalType.replace("-", " ")}. You need a matching goal to join.`
        );
      }
    }

    // Check if user is already a member
    const existingMember = await ctx.db
      .query("communityMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("communityId"), community._id))
      .first();

    if (existingMember) {
      throw new Error("You're already a member of this community");
    }

    // Check member count
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", community._id))
      .collect();

    if (members.length >= community.maxMembers) {
      throw new Error("This community is full");
    }

    // Add member
    await ctx.db.insert("communityMembers", {
      communityId: community._id,
      userId: args.userId,
      displayName: args.displayName,
      avatarUrl: args.avatarUrl,
      joinedAt: new Date().toISOString(),
      role: "member",
    });

    // Add activity feed entry
    await ctx.db.insert("activityFeed", {
      communityId: community._id,
      userId: args.userId,
      type: "member_joined",
      message: `${args.displayName} joined the community`,
      createdAt: new Date().toISOString(),
    });

    return { communityId: community._id, communityName: community.name };
  },
});

// List user's communities
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("communityMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const communities = await Promise.all(
      memberships.map(async (membership) => {
        const community = await ctx.db.get(membership.communityId);
        if (!community) return null;

        const members = await ctx.db
          .query("communityMembers")
          .withIndex("by_community", (q) => q.eq("communityId", community._id))
          .collect();

        return {
          ...community,
          memberCount: members.length,
          userRole: membership.role,
        };
      })
    );

    return communities.filter(Boolean);
  },
});

// Get community details with members
export const getWithMembers = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) return null;

    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    return {
      ...community,
      members,
    };
  },
});

// Leave community
export const leave = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("communityMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("communityId"), args.communityId))
      .first();

    if (!membership) {
      throw new Error("Not a member of this community");
    }

    // Check if user is the only admin
    if (membership.role === "admin") {
      const admins = await ctx.db
        .query("communityMembers")
        .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();

      if (admins.length === 1) {
        throw new Error(
          "Cannot leave: you're the only admin. Transfer ownership first."
        );
      }
    }

    await ctx.db.delete(membership._id);
    return { success: true };
  },
});

// Delete community (admin only)
export const remove = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) {
      throw new Error("Community not found");
    }

    if (community.createdBy !== args.userId) {
      throw new Error("Only the creator can delete this community");
    }

    // Delete all members
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete all activity feed entries
    const activities = await ctx.db
      .query("activityFeed")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }

    // Delete the community
    await ctx.db.delete(args.communityId);
    return { success: true };
  },
});

// Regenerate invite code (admin only)
export const regenerateInviteCode = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("communityMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("communityId"), args.communityId))
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Only admins can regenerate invite codes");
    }

    const newCode = generateInviteCode();
    await ctx.db.patch(args.communityId, { inviteCode: newCode });

    return { inviteCode: newCode };
  },
});
