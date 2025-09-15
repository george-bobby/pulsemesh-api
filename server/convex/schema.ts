import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	messages: defineTable({
		body: v.string(),
		title: v.string(),
		author: v.string(),
		authorName: v.string(),
		createdAt: v.number(),
	}).index('by_author', ['author']),

	apiProviders: defineTable({
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
	}).index('by_user', ['userId']),

	healthChecks: defineTable({
		providerId: v.id('apiProviders'),
		timestamp: v.number(),
		isHealthy: v.boolean(),
		latency: v.number(),
		statusCode: v.optional(v.number()),
		errorMessage: v.optional(v.string()),
		responseTime: v.number(),
	})
		.index('by_provider', ['providerId'])
		.index('by_timestamp', ['timestamp']),

	userProfiles: defineTable({
		userId: v.string(),
		email: v.string(),
		name: v.string(),
		profileImageUrl: v.optional(v.string()),
		createdAt: v.number(),
		lastLoginAt: v.number(),
	}).index('by_userId', ['userId']),

	// Self-healing and recovery metrics
	circuitBreakerMetrics: defineTable({
		providerId: v.id('apiProviders'),
		name: v.string(),
		state: v.string(), // CLOSED, OPEN, HALF_OPEN
		failureCount: v.number(),
		successCount: v.number(),
		totalRequests: v.number(),
		totalFailures: v.number(),
		totalSuccesses: v.number(),
		lastFailureTime: v.optional(v.number()),
		lastSuccessTime: v.optional(v.number()),
		stateChangedAt: v.number(),
		nextAttemptAt: v.optional(v.number()),
		timestamp: v.number(),
	})
		.index('by_provider', ['providerId'])
		.index('by_timestamp', ['timestamp'])
		.index('by_state', ['state']),

	retryMetrics: defineTable({
		operationName: v.string(),
		providerId: v.optional(v.id('apiProviders')),
		attemptNumber: v.number(),
		totalAttempts: v.number(),
		success: v.boolean(),
		delay: v.number(),
		error: v.optional(v.string()),
		timestamp: v.number(),
		latency: v.number(),
	})
		.index('by_operation', ['operationName'])
		.index('by_provider', ['providerId'])
		.index('by_timestamp', ['timestamp']),

	failoverEvents: defineTable({
		operationName: v.string(),
		primaryProviderId: v.id('apiProviders'),
		failoverProviderId: v.optional(v.id('apiProviders')),
		strategy: v.string(),
		totalAttempts: v.number(),
		success: v.boolean(),
		totalLatency: v.number(),
		fallbackUsed: v.boolean(),
		cacheUsed: v.boolean(),
		timestamp: v.number(),
		attempts: v.array(
			v.object({
				providerId: v.string(),
				providerName: v.string(),
				attempt: v.number(),
				success: v.boolean(),
				latency: v.optional(v.number()),
				error: v.optional(v.string()),
			})
		),
	})
		.index('by_operation', ['operationName'])
		.index('by_primary_provider', ['primaryProviderId'])
		.index('by_timestamp', ['timestamp']),

	selfHealingActions: defineTable({
		actionType: v.string(), // CIRCUIT_BREAKER_OPENED, FAILOVER_TRIGGERED, RETRY_ATTEMPTED, etc.
		providerId: v.optional(v.id('apiProviders')),
		operationName: v.optional(v.string()),
		details: v.object({
			previousState: v.optional(v.string()),
			newState: v.optional(v.string()),
			reason: v.string(),
			metadata: v.optional(v.any()),
		}),
		timestamp: v.number(),
		severity: v.string(), // INFO, WARNING, ERROR, CRITICAL
		resolved: v.boolean(),
		resolvedAt: v.optional(v.number()),
	})
		.index('by_type', ['actionType'])
		.index('by_provider', ['providerId'])
		.index('by_timestamp', ['timestamp'])
		.index('by_severity', ['severity']),

	anomalyDetection: defineTable({
		providerId: v.id('apiProviders'),
		anomalyType: v.string(), // LATENCY_SPIKE, ERROR_RATE_INCREASE, AVAILABILITY_DROP, etc.
		severity: v.string(), // LOW, MEDIUM, HIGH, CRITICAL
		confidence: v.number(), // 0-1 confidence score
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
		deviation: v.number(), // How much it deviates from baseline
		timestamp: v.number(),
		resolved: v.boolean(),
		resolvedAt: v.optional(v.number()),
		actionTaken: v.optional(v.string()),
	})
		.index('by_provider', ['providerId'])
		.index('by_type', ['anomalyType'])
		.index('by_severity', ['severity'])
		.index('by_timestamp', ['timestamp']),
});
