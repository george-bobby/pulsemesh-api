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
});
