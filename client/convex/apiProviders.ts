import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new API provider
export const create = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    endpoint: v.string(),
    isHealthy: v.boolean(),
    latency: v.number(),
    errorRate: v.number(),
    priority: v.number(),
    isPrimary: v.optional(v.boolean()),
    lastCheck: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Server-side functions don't require authentication for internal operations
    return await ctx.db.insert("apiProviders", {
      name: args.name,
      type: args.type,
      endpoint: args.endpoint,
      isHealthy: args.isHealthy,
      latency: args.latency,
      errorRate: args.errorRate,
      priority: args.priority,
      isPrimary: args.isPrimary,
      lastCheck: args.lastCheck,
      userId: args.userId,
    });
  },
});

// Get a specific API provider by ID
export const get = query({
  args: { id: v.id("apiProviders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all API providers for a specific user
export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("apiProviders")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

// Get all API providers (for admin/monitoring purposes)
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("apiProviders").collect();
  },
});

// Update an API provider
export const update = mutation({
  args: {
    id: v.id("apiProviders"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    endpoint: v.optional(v.string()),
    isHealthy: v.optional(v.boolean()),
    latency: v.optional(v.number()),
    errorRate: v.optional(v.number()),
    priority: v.optional(v.number()),
    isPrimary: v.optional(v.boolean()),
    lastCheck: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
  },
});

// Update provider health status
export const updateHealth = mutation({
  args: {
    id: v.id("apiProviders"),
    isHealthy: v.boolean(),
    latency: v.number(),
    errorRate: v.optional(v.number()),
    lastCheck: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...healthData } = args;
    
    const updates: any = {
      isHealthy: healthData.isHealthy,
      latency: healthData.latency,
      lastCheck: healthData.lastCheck,
    };

    if (healthData.errorRate !== undefined) {
      updates.errorRate = healthData.errorRate;
    }

    await ctx.db.patch(id, updates);
  },
});

// Delete an API provider
export const deleteProvider = mutation({
  args: { id: v.id("apiProviders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get providers that need health checks (server-specific)
export const getProvidersForHealthCheck = query({
  args: {},
  handler: async (ctx) => {
    // This is specifically for server-side monitoring
    return await ctx.db.query("apiProviders").collect();
  },
});
