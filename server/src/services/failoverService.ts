import { EventEmitter } from 'events';
import { ApiProvider } from '../types/index.js';

export enum FailoverStrategy {
  ROUND_ROBIN = 'ROUND_ROBIN',
  PRIORITY_BASED = 'PRIORITY_BASED',
  LEAST_LATENCY = 'LEAST_LATENCY',
  HEALTH_WEIGHTED = 'HEALTH_WEIGHTED'
}

export interface FailoverConfig {
  strategy: FailoverStrategy;
  maxFailoverAttempts: number;
  failoverCooldown: number; // Time before retrying a failed provider (ms)
  healthThreshold: number;  // Minimum health score (0-1) to consider provider
  latencyThreshold: number; // Maximum acceptable latency (ms)
  enableCaching: boolean;
  cacheTimeout: number;     // Cache timeout in ms
}

export interface ProviderHealth {
  providerId: string;
  isHealthy: boolean;
  latency: number;
  errorRate: number;
  lastCheck: number;
  consecutiveFailures: number;
  lastFailureTime: number | null;
  healthScore: number; // 0-1 calculated score
}

export interface FailoverAttempt {
  providerId: string;
  providerName: string;
  attempt: number;
  timestamp: number;
  success: boolean;
  latency?: number;
  error?: string;
}

export interface FailoverResult<T> {
  result?: T;
  providerId: string;
  providerName: string;
  attempts: FailoverAttempt[];
  totalAttempts: number;
  totalLatency: number;
  success: boolean;
  fallbackUsed: boolean;
  cacheUsed: boolean;
}

export class FailoverService extends EventEmitter {
  private providerHealth = new Map<string, ProviderHealth>();
  private roundRobinIndex = 0;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private failoverCooldowns = new Map<string, number>();

  private defaultConfig: FailoverConfig = {
    strategy: FailoverStrategy.PRIORITY_BASED,
    maxFailoverAttempts: 3,
    failoverCooldown: 30000, // 30 seconds
    healthThreshold: 0.7,
    latencyThreshold: 5000,  // 5 seconds
    enableCaching: true,
    cacheTimeout: 300000     // 5 minutes
  };

  async executeWithFailover<T>(
    providers: ApiProvider[],
    operation: (provider: ApiProvider) => Promise<T>,
    operationName: string,
    config?: Partial<FailoverConfig>,
    cacheKey?: string
  ): Promise<FailoverResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const attempts: FailoverAttempt[] = [];
    const startTime = Date.now();

    // Check cache first if enabled
    if (finalConfig.enableCaching && cacheKey) {
      const cachedResult = this.getFromCache<T>(cacheKey);
      if (cachedResult) {
        this.emit('cacheHit', { operationName, cacheKey });
        return {
          result: cachedResult,
          providerId: 'cache',
          providerName: 'cache',
          attempts: [],
          totalAttempts: 0,
          totalLatency: 0,
          success: true,
          fallbackUsed: false,
          cacheUsed: true
        };
      }
    }

    // Filter and sort providers based on strategy
    const availableProviders = this.selectProviders(providers, finalConfig);
    
    if (availableProviders.length === 0) {
      throw new Error('No healthy providers available for failover');
    }

    let lastError: Error;
    let result: T | undefined;
    let successfulProviderId: string | undefined;
    let successfulProviderName: string | undefined;

    for (let attempt = 0; attempt < Math.min(finalConfig.maxFailoverAttempts, availableProviders.length); attempt++) {
      const provider = availableProviders[attempt];
      const attemptStart = Date.now();

      // Check if provider is in cooldown
      if (this.isInCooldown(provider._id!, finalConfig.failoverCooldown)) {
        continue;
      }

      const attemptInfo: FailoverAttempt = {
        providerId: provider._id!,
        providerName: provider.name,
        attempt: attempt + 1,
        timestamp: attemptStart,
        success: false
      };

      try {
        this.emit('failoverAttempt', {
          operationName,
          provider: provider.name,
          attempt: attempt + 1,
          totalProviders: availableProviders.length
        });

        result = await operation(provider);
        
        const latency = Date.now() - attemptStart;
        attemptInfo.success = true;
        attemptInfo.latency = latency;
        attempts.push(attemptInfo);

        // Update provider health on success
        this.updateProviderHealth(provider._id!, true, latency);
        
        successfulProviderId = provider._id!;
        successfulProviderName = provider.name;

        // Cache the result if enabled
        if (finalConfig.enableCaching && cacheKey && result) {
          this.setCache(cacheKey, result, finalConfig.cacheTimeout);
        }

        this.emit('failoverSuccess', {
          operationName,
          provider: provider.name,
          attempt: attempt + 1,
          latency
        });

        break;

      } catch (error) {
        lastError = error as Error;
        attemptInfo.error = lastError.message;
        attempts.push(attemptInfo);

        // Update provider health on failure
        this.updateProviderHealth(provider._id!, false, Date.now() - attemptStart);
        this.setFailoverCooldown(provider._id!);

        this.emit('failoverAttemptFailed', {
          operationName,
          provider: provider.name,
          attempt: attempt + 1,
          error: lastError.message
        });
      }
    }

    const totalLatency = Date.now() - startTime;

    if (result !== undefined && successfulProviderId) {
      return {
        result,
        providerId: successfulProviderId,
        providerName: successfulProviderName!,
        attempts,
        totalAttempts: attempts.length,
        totalLatency,
        success: true,
        fallbackUsed: attempts.length > 1,
        cacheUsed: false
      };
    }

    // All providers failed - try to get from cache as last resort
    if (finalConfig.enableCaching && cacheKey) {
      const staleResult = this.getFromCache<T>(cacheKey, true); // Allow stale
      if (staleResult) {
        this.emit('staleCache', { operationName, cacheKey });
        return {
          result: staleResult,
          providerId: 'stale-cache',
          providerName: 'stale-cache',
          attempts,
          totalAttempts: attempts.length,
          totalLatency,
          success: true,
          fallbackUsed: true,
          cacheUsed: true
        };
      }
    }

    this.emit('failoverFailed', {
      operationName,
      totalAttempts: attempts.length,
      totalLatency,
      lastError: lastError!.message
    });

    throw new Error(
      `All failover attempts failed for ${operationName}. Last error: ${lastError!.message}`
    );
  }

  private selectProviders(providers: ApiProvider[], config: FailoverConfig): ApiProvider[] {
    // Filter out unhealthy providers
    const healthyProviders = providers.filter(provider => {
      const health = this.providerHealth.get(provider._id!);
      if (!health) return true; // No health data yet, assume healthy
      
      return health.healthScore >= config.healthThreshold &&
             health.latency <= config.latencyThreshold;
    });

    // Sort based on strategy
    switch (config.strategy) {
      case FailoverStrategy.PRIORITY_BASED:
        return healthyProviders.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      case FailoverStrategy.LEAST_LATENCY:
        return healthyProviders.sort((a, b) => {
          const healthA = this.providerHealth.get(a._id!) || { latency: 0 };
          const healthB = this.providerHealth.get(b._id!) || { latency: 0 };
          return healthA.latency - healthB.latency;
        });
      
      case FailoverStrategy.HEALTH_WEIGHTED:
        return healthyProviders.sort((a, b) => {
          const healthA = this.providerHealth.get(a._id!) || { healthScore: 1 };
          const healthB = this.providerHealth.get(b._id!) || { healthScore: 1 };
          return healthB.healthScore - healthA.healthScore;
        });
      
      case FailoverStrategy.ROUND_ROBIN:
        // Rotate starting position
        const rotated = [...healthyProviders];
        const startIndex = this.roundRobinIndex % rotated.length;
        this.roundRobinIndex++;
        return [...rotated.slice(startIndex), ...rotated.slice(0, startIndex)];
      
      default:
        return healthyProviders;
    }
  }

  private updateProviderHealth(providerId: string, success: boolean, latency: number): void {
    const existing = this.providerHealth.get(providerId) || {
      providerId,
      isHealthy: true,
      latency: 0,
      errorRate: 0,
      lastCheck: 0,
      consecutiveFailures: 0,
      lastFailureTime: null,
      healthScore: 1
    };

    existing.lastCheck = Date.now();
    existing.latency = latency;

    if (success) {
      existing.isHealthy = true;
      existing.consecutiveFailures = 0;
      existing.healthScore = Math.min(1, existing.healthScore + 0.1);
    } else {
      existing.isHealthy = false;
      existing.consecutiveFailures++;
      existing.lastFailureTime = Date.now();
      existing.healthScore = Math.max(0, existing.healthScore - 0.2);
    }

    // Calculate error rate (simplified)
    existing.errorRate = existing.consecutiveFailures > 0 ? 
      Math.min(1, existing.consecutiveFailures / 10) : 0;

    this.providerHealth.set(providerId, existing);
  }

  private isInCooldown(providerId: string, cooldownMs: number): boolean {
    const cooldownEnd = this.failoverCooldowns.get(providerId);
    return cooldownEnd ? Date.now() < cooldownEnd : false;
  }

  private setFailoverCooldown(providerId: string): void {
    this.failoverCooldowns.set(providerId, Date.now() + this.defaultConfig.failoverCooldown);
  }

  private getFromCache<T>(key: string, allowStale = false): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() > cached.timestamp + cached.ttl;
    if (isExpired && !allowStale) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Public methods
  getProviderHealth(providerId?: string): ProviderHealth | Map<string, ProviderHealth> {
    if (providerId) {
      return this.providerHealth.get(providerId) || null;
    }
    return new Map(this.providerHealth);
  }

  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  resetProviderHealth(providerId?: string): void {
    if (providerId) {
      this.providerHealth.delete(providerId);
      this.failoverCooldowns.delete(providerId);
    } else {
      this.providerHealth.clear();
      this.failoverCooldowns.clear();
    }
  }
}

// Singleton instance
export const failoverService = new FailoverService();
