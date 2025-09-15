import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create or update user profile
export const createOrUpdate = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    const now = Date.now();

    if (existingProfile) {
      // Update existing profile
      return await ctx.db.patch(existingProfile._id, {
        email: args.email,
        name: args.name,
        profileImageUrl: args.profileImageUrl,
        lastLoginAt: now,
      });
    } else {
      // Create new profile
      return await ctx.db.insert("userProfiles", {
        userId: args.userId,
        email: args.email,
        name: args.name,
        profileImageUrl: args.profileImageUrl,
        createdAt: now,
        lastLoginAt: now,
      });
    }
  },
});

// Get user profile by userId
export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    return profile;
  },
});

// Get all user profiles (for admin purposes)
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("userProfiles").collect();
  },
});

// Update user profile
export const update = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!profile) {
      throw new Error("User profile not found");
    }

    const updates: any = {
      lastLoginAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;
    if (args.profileImageUrl !== undefined)
      updates.profileImageUrl = args.profileImageUrl;

    return await ctx.db.patch(profile._id, updates);
  },
});

// Delete user profile
export const deleteUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!profile) {
      throw new Error("User profile not found");
    }

    return await ctx.db.delete(profile._id);
  },
});

// Update last login timestamp
export const updateLastLogin = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        lastLoginAt: Date.now(),
      });
    }

    return profile;
  },
});

// Get user stats (number of API providers, etc.)
export const getUserStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!profile) {
      return null;
    }

    // Count user's API providers
    const providerCount = await ctx.db
      .query("apiProviders")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect()
      .then((providers) => providers.length);

    // Count recent health checks for user's providers
    const userProviders = await ctx.db
      .query("apiProviders")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    let totalHealthChecks = 0;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const provider of userProviders) {
      const checks = await ctx.db
        .query("healthChecks")
        .filter((q) => q.eq(q.field("providerId"), provider._id))
        .filter((q) => q.gte(q.field("timestamp"), oneWeekAgo))
        .collect();
      totalHealthChecks += checks.length;
    }

    return {
      profile,
      stats: {
        providerCount,
        healthChecksLastWeek: totalHealthChecks,
        accountAge: Date.now() - profile.createdAt,
      },
    };
  },
});
