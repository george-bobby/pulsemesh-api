import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new health check result (server-side)
export const create = mutation({
  args: {
    providerId: v.id("apiProviders"),
    timestamp: v.number(),
    isHealthy: v.boolean(),
    latency: v.number(),
    statusCode: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    responseTime: v.number(),
    status: v.optional(v.union(v.literal('healthy'), v.literal('degraded'), v.literal('down'))),
  },
  handler: async (ctx, args) => {
    // Server can create health checks without authentication
    return await ctx.db.insert("healthChecks", {
      providerId: args.providerId,
      timestamp: args.timestamp,
      isHealthy: args.isHealthy,
      latency: args.latency,
      statusCode: args.statusCode,
      errorMessage: args.errorMessage,
      responseTime: args.responseTime,
      status: args.status,
    });
  },
});

// Get health check history for a specific provider (server-side)
export const getHistory = query({
  args: { 
    providerId: v.id("apiProviders"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    
    return await ctx.db
      .query("healthChecks")
      .filter((q) => q.eq(q.field("providerId"), args.providerId))
      .order("desc")
      .take(limit);
  },
});

// Get the latest health check for a specific provider
export const getLatest = query({
  args: { 
    providerId: v.id("apiProviders"),
  },
  handler: async (ctx, args) => {
    const checks = await ctx.db
      .query("healthChecks")
      .filter((q) => q.eq(q.field("providerId"), args.providerId))
      .order("desc")
      .take(1);
    
    return checks.length > 0 ? checks[0] : null;
  },
});

// Get the latest health checks for all providers (grouped by provider)
export const getLatestForAllProviders = query({
  args: {},
  handler: async (ctx) => {
    // Get all health checks ordered by timestamp desc
    const allChecks = await ctx.db
      .query("healthChecks")
      .order("desc")
      .collect();
    
    // Group by providerId and keep only the latest for each
    const latestByProvider = new Map();
    for (const check of allChecks) {
      if (!latestByProvider.has(check.providerId)) {
        latestByProvider.set(check.providerId, check);
      }
    }
    
    return Array.from(latestByProvider.values());
  },
});

// Get recent health checks across all providers (server-side)
export const getRecentChecks = query({
  args: { 
    limit: v.optional(v.number()),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let query = ctx.db.query("healthChecks").order("desc");
    
    if (args.since) {
      query = query.filter((q) => q.gte(q.field("timestamp"), args.since));
    }
    
    return await query.take(limit);
  },
});

// Get health statistics for a provider (server-side)
export const getStats = query({
  args: { 
    providerId: v.id("apiProviders"),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("healthChecks")
      .filter((q) => q.eq(q.field("providerId"), args.providerId));
    
    if (args.since) {
      query = query.filter((q) => q.gte(q.field("timestamp"), args.since));
    }
    
    const checks = await query.collect();
    
    if (checks.length === 0) {
      return {
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        averageLatency: 0,
        uptime: 0,
        lastCheck: null,
      };
    }

    const successfulChecks = checks.filter(check => check.isHealthy).length;
    const failedChecks = checks.length - successfulChecks;
    const averageLatency = checks.reduce((sum, check) => sum + check.latency, 0) / checks.length;
    const uptime = (successfulChecks / checks.length) * 100;
    const lastCheck = checks[0]; // Most recent check

    return {
      totalChecks: checks.length,
      successfulChecks,
      failedChecks,
      averageLatency: Math.round(averageLatency),
      uptime: Math.round(uptime * 100) / 100,
      lastCheck: lastCheck.timestamp,
    };
  },
});

// Clean up old health check records (server-side)
export const cleanup = mutation({
  args: { 
    olderThan: v.number(), // timestamp
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 1000;
    
    const oldChecks = await ctx.db
      .query("healthChecks")
      .filter((q) => q.lt(q.field("timestamp"), args.olderThan))
      .order("asc")
      .take(limit);
    
    for (const check of oldChecks) {
      await ctx.db.delete(check._id);
    }
    
    return oldChecks.length;
  },
});
