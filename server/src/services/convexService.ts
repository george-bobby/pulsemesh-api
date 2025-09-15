import { ConvexHttpClient } from 'convex/browser';
import type { Id } from 'convex/_generated/dataModel';
import { api } from '../../convex/_generated/api.js';
import { env } from '../config/env.js';
import { ApiProvider, HealthCheckResult, ApiError } from '../types/index.js';

export class ConvexService {
	private client: ConvexHttpClient;

	constructor() {
		this.client = new ConvexHttpClient(env.CONVEX_URL);
	}

	// Create an authenticated client for user-specific operations
	private getAuthenticatedClient(token: string): ConvexHttpClient {
		const authenticatedClient = new ConvexHttpClient(env.CONVEX_URL);
		authenticatedClient.setAuth(async () => token);
		return authenticatedClient;
	}

	// API Provider CRUD Operations
	async createApiProvider(provider: Omit<ApiProvider, '_id'>): Promise<string> {
		try {
			const result = await this.client.mutation(
				api.apiProviders.create,
				provider
			);
			return result;
		} catch (error: any) {
			throw new ApiError(
				`Failed to create API provider: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async getApiProvider(id: string): Promise<ApiProvider | null> {
		try {
			const result = await this.client.query(api.apiProviders.get, {
				id: id as Id<'apiProviders'>,
			});
			return result;
		} catch (error: any) {
			throw new ApiError(
				`Failed to get API provider: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async getApiProvidersByUser(
		userId: string,
		token?: string
	): Promise<ApiProvider[]> {
		try {
			const client = token ? this.getAuthenticatedClient(token) : this.client;
			const result = await client.query(api.apiProviders.getByUser, {
				userId,
			});
			return result || [];
		} catch (error: any) {
			throw new ApiError(
				`Failed to get API providers for user: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async getAllApiProviders(): Promise<ApiProvider[]> {
		try {
			const result = await this.client.query(
				api.apiProviders.getProvidersForHealthCheck
			);
			return result || [];
		} catch (error: any) {
			throw new ApiError(
				`Failed to get all API providers: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async updateApiProvider(
		id: string,
		updates: Partial<ApiProvider>
	): Promise<void> {
		try {
			await this.client.mutation(api.apiProviders.update, {
				id: id as Id<'apiProviders'>,
				...updates,
			});
		} catch (error: any) {
			throw new ApiError(
				`Failed to update API provider: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async deleteApiProvider(id: string): Promise<void> {
		try {
			await this.client.mutation(api.apiProviders.deleteProvider, {
				id: id as Id<'apiProviders'>,
			});
		} catch (error: any) {
			throw new ApiError(
				`Failed to delete API provider: ${error?.message || String(error)}`,
				500
			);
		}
	}

	// Health Check Operations
	async updateProviderHealth(
		id: string,
		healthData: {
			isHealthy: boolean;
			latency: number;
			errorRate?: number;
			lastCheck: string;
		}
	): Promise<void> {
		try {
			await this.client.mutation(api.apiProviders.updateHealth, {
				id: id as Id<'apiProviders'>,
				...healthData,
			});
		} catch (error: any) {
			throw new ApiError(
				`Failed to update provider health: ${error?.message || String(error)}`,
				500
			);
		}
	}

	// Health Check History Operations
	async createHealthCheckResult(result: HealthCheckResult): Promise<string> {
		try {
			const healthResult = await this.client.mutation(api.healthChecks.create, {
				...result,
				providerId: result.providerId as Id<'apiProviders'>,
			});
			return healthResult;
		} catch (error: any) {
			throw new ApiError(
				`Failed to create health check result: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async getHealthCheckHistory(
		providerId: string,
		limit: number = 100
	): Promise<HealthCheckResult[]> {
		try {
			const result = await this.client.query(api.healthChecks.getHistory, {
				providerId: providerId as Id<'apiProviders'>,
				limit,
			});
			return result || [];
		} catch (error: any) {
			throw new ApiError(
				`Failed to get health check history: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async getRecentHealthChecks(
		limit: number = 50
	): Promise<HealthCheckResult[]> {
		try {
			const result = await this.client.query(api.healthChecks.getRecentChecks, {
				limit,
			});
			return result || [];
		} catch (error: any) {
			throw new ApiError(
				`Failed to get recent health checks: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async getHealthCheckStats(
		providerId: string,
		since: number
	): Promise<{
		totalChecks: number;
		successfulChecks: number;
		failedChecks: number;
		averageLatency: number;
		uptime: number;
		lastCheck: number | null;
	}> {
		try {
			const result = await this.client.query(api.healthChecks.getStats, {
				providerId: providerId as Id<'apiProviders'>,
				since,
			});
			return (
				result || {
					totalChecks: 0,
					successfulChecks: 0,
					failedChecks: 0,
					averageLatency: 0,
					uptime: 0,
					lastCheck: null,
				}
			);
		} catch (error: any) {
			throw new ApiError(
				`Failed to get health check stats: ${error?.message || String(error)}`,
				500
			);
		}
	}

	// User Profile Operations
	async createOrUpdateUserProfile(profile: {
		userId: string;
		email: string;
		name: string;
		profileImageUrl?: string;
	}): Promise<void> {
		try {
			await this.client.mutation(api.userProfiles.createOrUpdate, profile);
		} catch (error: any) {
			throw new ApiError(
				`Failed to create/update user profile: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async getUserProfile(userId: string): Promise<any> {
		try {
			const result = await this.client.query(api.userProfiles.get, { userId });
			return result;
		} catch (error: any) {
			throw new ApiError(
				`Failed to get user profile: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async updateUserProfile(
		userId: string,
		updates: {
			name?: string;
			email?: string;
			profileImageUrl?: string;
		}
	): Promise<void> {
		try {
			await this.client.mutation(api.userProfiles.update, {
				userId,
				...updates,
			});
		} catch (error: any) {
			throw new ApiError(
				`Failed to update user profile: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async deleteUserProfile(userId: string): Promise<void> {
		try {
			await this.client.mutation(api.userProfiles.deleteUser, { userId });
		} catch (error: any) {
			throw new ApiError(
				`Failed to delete user profile: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async updateUserLastLogin(userId: string): Promise<any> {
		try {
			const result = await this.client.mutation(
				api.userProfiles.updateLastLogin,
				{ userId }
			);
			return result;
		} catch (error: any) {
			throw new ApiError(
				`Failed to update last login: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async getUserStats(userId: string): Promise<any> {
		try {
			const result = await this.client.query(api.userProfiles.getUserStats, {
				userId,
			});
			return result;
		} catch (error: any) {
			throw new ApiError(
				`Failed to get user stats: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async getAllUserProfiles(): Promise<any[]> {
		try {
			const result = await this.client.query(api.userProfiles.getAll);
			return result || [];
		} catch (error: any) {
			throw new ApiError(
				`Failed to get all user profiles: ${error?.message || String(error)}`,
				500
			);
		}
	}

	// Utility Methods
	async ping(): Promise<boolean> {
		try {
			// Use a simple query that should exist to test connectivity
			await this.client.query(api.apiProviders.getAll);
			return true;
		} catch (error) {
			return false;
		}
	}

	// Batch Operations
	async batchUpdateProviderHealth(
		updates: Array<{
			id: string;
			isHealthy: boolean;
			latency: number;
			errorRate?: number;
			lastCheck: string;
		}>
	): Promise<void> {
		try {
			await Promise.all(
				updates.map((update) => this.updateProviderHealth(update.id, update))
			);
		} catch (error: any) {
			throw new ApiError(
				`Failed to batch update provider health: ${error?.message || String(error)}`,
				500
			);
		}
	}

	// Self-healing metrics methods
	async createSelfHealingAction(action: {
		actionType: string;
		providerId?: string;
		operationName?: string;
		details: {
			previousState?: string;
			newState?: string;
			reason: string;
			metadata?: any;
		};
		severity: string;
		resolved?: boolean;
	}): Promise<string> {
		try {
			const result = await this.client.mutation(
				'selfHealingMetrics:createSelfHealingAction',
				action
			);
			return result;
		} catch (error: any) {
			throw new ApiError(
				`Failed to create self-healing action: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async getSelfHealingStats(since?: number): Promise<any> {
		try {
			const result = await this.client.query(
				'selfHealingMetrics:getSelfHealingStats',
				{ since }
			);
			return result;
		} catch (error: any) {
			throw new ApiError(
				`Failed to get self-healing stats: ${error?.message || String(error)}`,
				500
			);
		}
	}

	async createAnomalyDetection(anomaly: {
		providerId: string;
		anomalyType: string;
		severity: string;
		confidence: number;
		baseline: any;
		current: any;
		deviation: number;
		actionTaken?: string;
	}): Promise<string> {
		try {
			const result = await this.client.mutation(
				'selfHealingMetrics:createAnomalyDetection',
				anomaly
			);
			return result;
		} catch (error: any) {
			throw new ApiError(
				`Failed to create anomaly detection: ${error?.message || String(error)}`,
				500
			);
		}
	}
}

// Singleton instance
export const convexService = new ConvexService();
