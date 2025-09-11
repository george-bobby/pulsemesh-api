import { ConvexHttpClient } from 'convex/browser';
import { env } from '../config/env.js';
import { ApiProvider, HealthCheckResult, ApiError } from '../types/index.js';

export class ConvexService {
	private client: ConvexHttpClient;

	constructor() {
		this.client = new ConvexHttpClient(env.CONVEX_URL);
	}

	// API Provider CRUD Operations
	async createApiProvider(provider: Omit<ApiProvider, '_id'>): Promise<string> {
		try {
			const result = await this.client.mutation(
				'apiProviders:create',
				provider
			);
			return result;
		} catch (error) {
			throw new ApiError(
				`Failed to create API provider: ${error.message}`,
				500
			);
		}
	}

	async getApiProvider(id: string): Promise<ApiProvider | null> {
		try {
			const result = await this.client.query('apiProviders:get', { id });
			return result;
		} catch (error) {
			throw new ApiError(`Failed to get API provider: ${error.message}`, 500);
		}
	}

	async getApiProvidersByUser(userId: string): Promise<ApiProvider[]> {
		try {
			const result = await this.client.query('apiProviders:getByUser', {
				userId,
			});
			return result || [];
		} catch (error) {
			throw new ApiError(
				`Failed to get API providers for user: ${error.message}`,
				500
			);
		}
	}

	async getAllApiProviders(): Promise<ApiProvider[]> {
		try {
			const result = await this.client.query(
				'apiProviders:getProvidersForHealthCheck'
			);
			return result || [];
		} catch (error) {
			throw new ApiError(
				`Failed to get all API providers: ${error.message}`,
				500
			);
		}
	}

	async updateApiProvider(
		id: string,
		updates: Partial<ApiProvider>
	): Promise<void> {
		try {
			await this.client.mutation('apiProviders:update', { id, ...updates });
		} catch (error) {
			throw new ApiError(
				`Failed to update API provider: ${error.message}`,
				500
			);
		}
	}

	async deleteApiProvider(id: string): Promise<void> {
		try {
			await this.client.mutation('apiProviders:deleteProvider', { id });
		} catch (error) {
			throw new ApiError(
				`Failed to delete API provider: ${error.message}`,
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
			await this.client.mutation('apiProviders:updateHealth', {
				id,
				...healthData,
			});
		} catch (error) {
			throw new ApiError(
				`Failed to update provider health: ${error.message}`,
				500
			);
		}
	}

	// Health Check History Operations
	async createHealthCheckResult(result: HealthCheckResult): Promise<string> {
		try {
			const healthResult = await this.client.mutation(
				'healthChecks:create',
				result
			);
			return healthResult;
		} catch (error) {
			throw new ApiError(
				`Failed to create health check result: ${error.message}`,
				500
			);
		}
	}

	async getHealthCheckHistory(
		providerId: string,
		limit: number = 100
	): Promise<HealthCheckResult[]> {
		try {
			const result = await this.client.query('healthChecks:getHistory', {
				providerId,
				limit,
			});
			return result || [];
		} catch (error) {
			throw new ApiError(
				`Failed to get health check history: ${error.message}`,
				500
			);
		}
	}

	// User Profile Operations
	async getUserProfile(userId: string): Promise<any> {
		try {
			const result = await this.client.query('userProfiles:get', { userId });
			return result;
		} catch (error) {
			throw new ApiError(`Failed to get user profile: ${error.message}`, 500);
		}
	}

	async createOrUpdateUserProfile(profile: {
		userId: string;
		email: string;
		name: string;
		profileImageUrl?: string;
	}): Promise<void> {
		try {
			await this.client.mutation('userProfiles:createOrUpdate', {
				...profile,
				createdAt: Date.now(),
				lastLoginAt: Date.now(),
			});
		} catch (error) {
			throw new ApiError(
				`Failed to create/update user profile: ${error.message}`,
				500
			);
		}
	}

	// Utility Methods
	async ping(): Promise<boolean> {
		try {
			await this.client.query('system:ping');
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
		} catch (error) {
			throw new ApiError(
				`Failed to batch update provider health: ${error.message}`,
				500
			);
		}
	}
}

// Singleton instance
export const convexService = new ConvexService();
