import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Circuit Breaker Metrics
export const createCircuitBreakerMetric = mutation({
  args: {
    providerId: v.id("apiProviders"),
    name: v.string(),
    state: v.string(),
    failureCount: v.number(),
    successCount: v.number(),
    totalRequests: v.number(),
    totalFailures: v.number(),
    totalSuccesses: v.number(),
    lastFailureTime: v.optional(v.number()),
    lastSuccessTime: v.optional(v.number()),
    stateChangedAt: v.number(),
    nextAttemptAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("circuitBreakerMetrics", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getCircuitBreakerMetrics = query({
  args: {
    providerId: v.optional(v.id("apiProviders")),
    since: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("circuitBreakerMetrics");
    
    if (args.providerId) {
      query = query.withIndex("by_provider", (q) => q.eq("providerId", args.providerId));
    }
    
    if (args.since) {
      query = query.filter((q) => q.gte(q.field("timestamp"), args.since));
    }
    
    return await query
      .order("desc")
      .take(args.limit || 100);
  },
});

// Retry Metrics
export const createRetryMetric = mutation({
  args: {
    operationName: v.string(),
    providerId: v.optional(v.id("apiProviders")),
    attemptNumber: v.number(),
    totalAttempts: v.number(),
    success: v.boolean(),
    delay: v.number(),
    error: v.optional(v.string()),
    latency: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("retryMetrics", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getRetryMetrics = query({
  args: {
    operationName: v.optional(v.string()),
    providerId: v.optional(v.id("apiProviders")),
    since: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("retryMetrics");
    
    if (args.operationName) {
      query = query.withIndex("by_operation", (q) => q.eq("operationName", args.operationName));
    } else if (args.providerId) {
      query = query.withIndex("by_provider", (q) => q.eq("providerId", args.providerId));
    }
    
    if (args.since) {
      query = query.filter((q) => q.gte(q.field("timestamp"), args.since));
    }
    
    return await query
      .order("desc")
      .take(args.limit || 100);
  },
});

// Failover Events
export const createFailoverEvent = mutation({
  args: {
    operationName: v.string(),
    primaryProviderId: v.id("apiProviders"),
    failoverProviderId: v.optional(v.id("apiProviders")),
    strategy: v.string(),
    totalAttempts: v.number(),
    success: v.boolean(),
    totalLatency: v.number(),
    fallbackUsed: v.boolean(),
    cacheUsed: v.boolean(),
    attempts: v.array(v.object({
      providerId: v.string(),
      providerName: v.string(),
      attempt: v.number(),
      success: v.boolean(),
      latency: v.optional(v.number()),
      error: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("failoverEvents", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getFailoverEvents = query({
  args: {
    operationName: v.optional(v.string()),
    providerId: v.optional(v.id("apiProviders")),
    since: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("failoverEvents");
    
    if (args.operationName) {
      query = query.withIndex("by_operation", (q) => q.eq("operationName", args.operationName));
    } else if (args.providerId) {
      query = query.withIndex("by_primary_provider", (q) => q.eq("primaryProviderId", args.providerId));
    }
    
    if (args.since) {
      query = query.filter((q) => q.gte(q.field("timestamp"), args.since));
    }
    
    return await query
      .order("desc")
      .take(args.limit || 100);
  },
});

// Self-Healing Actions
export const createSelfHealingAction = mutation({
  args: {
    actionType: v.string(),
    providerId: v.optional(v.id("apiProviders")),
    operationName: v.optional(v.string()),
    details: v.object({
      previousState: v.optional(v.string()),
      newState: v.optional(v.string()),
      reason: v.string(),
      metadata: v.optional(v.any()),
    }),
    severity: v.string(),
    resolved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("selfHealingActions", {
      ...args,
      timestamp: Date.now(),
      resolved: args.resolved || false,
    });
  },
});

export const resolveSelfHealingAction = mutation({
  args: {
    actionId: v.id("selfHealingActions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.actionId, {
      resolved: true,
      resolvedAt: Date.now(),
    });
  },
});

export const getSelfHealingActions = query({
  args: {
    actionType: v.optional(v.string()),
    providerId: v.optional(v.id("apiProviders")),
    severity: v.optional(v.string()),
    resolved: v.optional(v.boolean()),
    since: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("selfHealingActions");
    
    if (args.actionType) {
      query = query.withIndex("by_type", (q) => q.eq("actionType", args.actionType));
    } else if (args.providerId) {
      query = query.withIndex("by_provider", (q) => q.eq("providerId", args.providerId));
    } else if (args.severity) {
      query = query.withIndex("by_severity", (q) => q.eq("severity", args.severity));
    }
    
    if (args.resolved !== undefined) {
      query = query.filter((q) => q.eq(q.field("resolved"), args.resolved));
    }
    
    if (args.since) {
      query = query.filter((q) => q.gte(q.field("timestamp"), args.since));
    }
    
    return await query
      .order("desc")
      .take(args.limit || 100);
  },
});

// Anomaly Detection
export const createAnomalyDetection = mutation({
  args: {
    providerId: v.id("apiProviders"),
    anomalyType: v.string(),
    severity: v.string(),
    confidence: v.number(),
    baseline: v.object({
      averageLatency: v.number(),
      errorRate: v.number(),
      availability: v.number(),
    }),
    current: v.object({
      averageLatency: v.number(),
      errorRate: v.number(),
      availability: v.number(),
    }),
    deviation: v.number(),
    actionTaken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("anomalyDetection", {
      ...args,
      timestamp: Date.now(),
      resolved: false,
    });
  },
});

export const resolveAnomaly = mutation({
  args: {
    anomalyId: v.id("anomalyDetection"),
    actionTaken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.anomalyId, {
      resolved: true,
      resolvedAt: Date.now(),
      actionTaken: args.actionTaken,
    });
  },
});

export const getAnomalies = query({
  args: {
    providerId: v.optional(v.id("apiProviders")),
    anomalyType: v.optional(v.string()),
    severity: v.optional(v.string()),
    resolved: v.optional(v.boolean()),
    since: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("anomalyDetection");
    
    if (args.providerId) {
      query = query.withIndex("by_provider", (q) => q.eq("providerId", args.providerId));
    } else if (args.anomalyType) {
      query = query.withIndex("by_type", (q) => q.eq("anomalyType", args.anomalyType));
    } else if (args.severity) {
      query = query.withIndex("by_severity", (q) => q.eq("severity", args.severity));
    }
    
    if (args.resolved !== undefined) {
      query = query.filter((q) => q.eq(q.field("resolved"), args.resolved));
    }
    
    if (args.since) {
      query = query.filter((q) => q.gte(q.field("timestamp"), args.since));
    }
    
    return await query
      .order("desc")
      .take(args.limit || 100);
  },
});

// Analytics and Aggregations
export const getSelfHealingStats = query({
  args: {
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const since = args.since || Date.now() - 24 * 60 * 60 * 1000; // Last 24 hours
    
    // Get all self-healing actions
    const actions = await ctx.db
      .query("selfHealingActions")
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();
    
    // Get all failover events
    const failovers = await ctx.db
      .query("failoverEvents")
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();
    
    // Get all anomalies
    const anomalies = await ctx.db
      .query("anomalyDetection")
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();
    
    return {
      totalActions: actions.length,
      resolvedActions: actions.filter(a => a.resolved).length,
      criticalActions: actions.filter(a => a.severity === "CRITICAL").length,
      totalFailovers: failovers.length,
      successfulFailovers: failovers.filter(f => f.success).length,
      totalAnomalies: anomalies.length,
      resolvedAnomalies: anomalies.filter(a => a.resolved).length,
      averageRecoveryTime: this.calculateAverageRecoveryTime(actions),
      topFailureReasons: this.getTopFailureReasons(actions),
    };
  },
});

function calculateAverageRecoveryTime(actions: any[]): number {
  const resolvedActions = actions.filter(a => a.resolved && a.resolvedAt);
  if (resolvedActions.length === 0) return 0;
  
  const totalRecoveryTime = resolvedActions.reduce((sum, action) => {
    return sum + (action.resolvedAt - action.timestamp);
  }, 0);
  
  return totalRecoveryTime / resolvedActions.length;
}

function getTopFailureReasons(actions: any[]): Array<{ reason: string; count: number }> {
  const reasonCounts = new Map<string, number>();
  
  actions.forEach(action => {
    const reason = action.details.reason;
    reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
  });
  
  return Array.from(reasonCounts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
