import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("author"), identity.email))
      .collect();
  },
});

export const getAllMessages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.query("messages").order("desc").take(50);
  },
});

export const sendMessage = mutation({
  args: {
    body: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const message = {
      body: args.body,
      title: args.title || "Untitled",
      author: identity.email || "Unknown",
      authorName: identity.name || "Anonymous",
      createdAt: Date.now(),
    };

    await ctx.db.insert("messages", message);
  },
});

export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    return {
      email: identity.email,
      name: identity.name,
      userId: identity.subject,
      profileImageUrl: identity.pictureUrl,
    };
  },
});
