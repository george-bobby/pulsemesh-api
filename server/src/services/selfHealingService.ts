import { EventEmitter } from 'events';
import { circuitBreakerService, CircuitBreakerState } from './circuitBreakerService.js';
import { retryService } from './retryService.js';
import { failoverService, FailoverStrategy } from './failoverService.js';
import { convexService } from './convexService.js';
import { ApiProvider } from '../types/index.js';

export interface SelfHealingConfig {
  enableCircuitBreaker: boolean;
  enableRetry: boolean;
  enableFailover: boolean;
  enableAnomalyDetection: boolean;
  circuitBreakerConfig?: any;
  retryConfig?: any;
  failoverConfig?: any;
  anomalyThresholds: {
    latencyMultiplier: number;    // Alert if latency > baseline * multiplier
    errorRateThreshold: number;   // Alert if error rate > threshold
    availabilityThreshold: number; // Alert if availability < threshold
  };
}

export interface SelfHealingResult<T> {
  result?: T;
  success: boolean;
  actionsPerformed: string[];
  providersUsed: string[];
  totalLatency: number;
  fallbackUsed: boolean;
  cacheUsed: boolean;
  anomaliesDetected: string[];
}

export class SelfHealingService extends EventEmitter {
  private defaultConfig: SelfHealingConfig = {
    enableCircuitBreaker: true,
    enableRetry: true,
    enableFailover: true,
    enableAnomalyDetection: true,
    anomalyThresholds: {
      latencyMultiplier: 2.0,
      errorRateThreshold: 0.1,
      availabilityThreshold: 0.95
    }
  };

  private providerBaselines = new Map<string, {
    averageLatency: number;
    errorRate: number;
    availability: number;
    lastUpdated: number;
  }>();

  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen to circuit breaker events
    circuitBreakerService.on('stateChanged', async (event) => {
      await this.logSelfHealingAction('CIRCUIT_BREAKER_STATE_CHANGED', {
        previousState: event.previousState,
        newState: event.state,
        reason: `Circuit breaker ${event.name} changed state`,
        metadata: event
      }, 'WARNING');
    });

    // Listen to retry events
    retryService.on('retryAttempt', async (event) => {
      await this.logSelfHealingAction('RETRY_ATTEMPTED', {
        reason: `Retry attempt ${event.attempt} for ${event.operationName}`,
        metadata: event
      }, 'INFO');
    });

    retryService.on('retrySucceeded', async (event) => {
      await this.logSelfHealingAction('RETRY_SUCCEEDED', {
        reason: `Retry succeeded after ${event.totalAttempts} attempts for ${event.operationName}`,
        metadata: event
      }, 'INFO');
    });

    // Listen to failover events
    failoverService.on('failoverAttempt', async (event) => {
      await this.logSelfHealingAction('FAILOVER_ATTEMPTED', {
        reason: `Failover attempt to ${event.provider} for ${event.operationName}`,
        metadata: event
      }, 'WARNING');
    });

    failoverService.on('failoverSuccess', async (event) => {
      await this.logSelfHealingAction('FAILOVER_SUCCEEDED', {
        reason: `Failover succeeded to ${event.provider} for ${event.operationName}`,
        metadata: event
      }, 'INFO');
    });
  }

  async executeWithSelfHealing<T>(
    providers: ApiProvider[],
    operation: (provider: ApiProvider) => Promise<T>,
    operationName: string,
    config?: Partial<SelfHealingConfig>
  ): Promise<SelfHealingResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();
    const actionsPerformed: string[] = [];
    const providersUsed: string[] = [];
    const anomaliesDetected: string[] = [];

    try {
      // Step 1: Check for anomalies in provider health
      if (finalConfig.enableAnomalyDetection) {
        const detectedAnomalies = await this.detectAnomalies(providers, finalConfig);
        anomaliesDetected.push(...detectedAnomalies);
      }

      // Step 2: Execute with circuit breaker and retry
      if (finalConfig.enableCircuitBreaker && finalConfig.enableRetry) {
        actionsPerformed.push('CIRCUIT_BREAKER_CHECK', 'RETRY_ENABLED');
        
        const result = await this.executeWithCircuitBreakerAndRetry(
          providers,
          operation,
          operationName,
          finalConfig
        );
        
        providersUsed.push(...result.providersUsed);
        
        return {
          result: result.result,
          success: true,
          actionsPerformed,
          providersUsed,
          totalLatency: Date.now() - startTime,
          fallbackUsed: result.fallbackUsed,
          cacheUsed: result.cacheUsed,
          anomaliesDetected
        };
      }

      // Step 3: Fallback to failover if circuit breaker/retry fails
      if (finalConfig.enableFailover) {
        actionsPerformed.push('FAILOVER_TRIGGERED');
        
        const failoverResult = await failoverService.executeWithFailover(
          providers,
          operation,
          operationName,
          finalConfig.failoverConfig
        );

        providersUsed.push(failoverResult.providerName);

        // Log failover event
        await this.logFailoverEvent(failoverResult, operationName);

        return {
          result: failoverResult.result,
          success: failoverResult.success,
          actionsPerformed,
          providersUsed,
          totalLatency: Date.now() - startTime,
          fallbackUsed: failoverResult.fallbackUsed,
          cacheUsed: failoverResult.cacheUsed,
          anomaliesDetected
        };
      }

      // Step 4: Last resort - try each provider once
      actionsPerformed.push('LAST_RESORT_ATTEMPT');
      for (const provider of providers) {
        try {
          const result = await operation(provider);
          providersUsed.push(provider.name);
          
          return {
            result,
            success: true,
            actionsPerformed,
            providersUsed,
            totalLatency: Date.now() - startTime,
            fallbackUsed: true,
            cacheUsed: false,
            anomaliesDetected
          };
        } catch (error) {
          // Continue to next provider
        }
      }

      throw new Error('All self-healing strategies failed');

    } catch (error) {
      await this.logSelfHealingAction('SELF_HEALING_FAILED', {
        reason: `All self-healing strategies failed for ${operationName}`,
        metadata: { error: error.message, actionsPerformed }
      }, 'CRITICAL');

      return {
        success: false,
        actionsPerformed,
        providersUsed,
        totalLatency: Date.now() - startTime,
        fallbackUsed: true,
        cacheUsed: false,
        anomaliesDetected
      };
    }
  }

  private async executeWithCircuitBreakerAndRetry<T>(
    providers: ApiProvider[],
    operation: (provider: ApiProvider) => Promise<T>,
    operationName: string,
    config: SelfHealingConfig
  ): Promise<{ result?: T; providersUsed: string[]; fallbackUsed: boolean; cacheUsed: boolean }> {
    const providersUsed: string[] = [];

    for (const provider of providers) {
      const circuitBreaker = circuitBreakerService.getOrCreateCircuitBreaker(
        `${provider._id}-${operationName}`,
        config.circuitBreakerConfig
      );

      try {
        const result = await retryService.executeWithRetry(
          async () => {
            return await circuitBreaker.execute(async () => {
              providersUsed.push(provider.name);
              return await operation(provider);
            });
          },
          `${operationName}-${provider.name}`,
          config.retryConfig
        );

        // Log circuit breaker metrics
        await this.logCircuitBreakerMetrics(circuitBreaker, provider._id!);

        return { result, providersUsed, fallbackUsed: false, cacheUsed: false };

      } catch (error) {
        // Continue to next provider
        continue;
      }
    }

    throw new Error('All providers failed with circuit breaker and retry');
  }

  private async detectAnomalies(
    providers: ApiProvider[],
    config: SelfHealingConfig
  ): Promise<string[]> {
    const anomalies: string[] = [];

    for (const provider of providers) {
      const baseline = this.providerBaselines.get(provider._id!);
      if (!baseline) {
        // Initialize baseline
        await this.updateProviderBaseline(provider._id!);
        continue;
      }

      const current = {
        averageLatency: provider.latency,
        errorRate: provider.errorRate,
        availability: provider.isHealthy ? 1 : 0
      };

      // Check latency anomaly
      if (current.averageLatency > baseline.averageLatency * config.anomalyThresholds.latencyMultiplier) {
        anomalies.push(`LATENCY_SPIKE_${provider.name}`);
        await this.logAnomaly(provider._id!, 'LATENCY_SPIKE', baseline, current);
      }

      // Check error rate anomaly
      if (current.errorRate > config.anomalyThresholds.errorRateThreshold) {
        anomalies.push(`ERROR_RATE_INCREASE_${provider.name}`);
        await this.logAnomaly(provider._id!, 'ERROR_RATE_INCREASE', baseline, current);
      }

      // Check availability anomaly
      if (current.availability < config.anomalyThresholds.availabilityThreshold) {
        anomalies.push(`AVAILABILITY_DROP_${provider.name}`);
        await this.logAnomaly(provider._id!, 'AVAILABILITY_DROP', baseline, current);
      }
    }

    return anomalies;
  }

  private async updateProviderBaseline(providerId: string): Promise<void> {
    try {
      const stats = await convexService.getHealthCheckStats(providerId, Date.now() - 24 * 60 * 60 * 1000);
      
      this.providerBaselines.set(providerId, {
        averageLatency: stats.averageLatency,
        errorRate: 1 - stats.uptime,
        availability: stats.uptime,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Failed to update provider baseline:', error);
    }
  }

  private async logSelfHealingAction(
    actionType: string,
    details: any,
    severity: string,
    providerId?: string
  ): Promise<void> {
    try {
      await convexService.client.mutation('selfHealingMetrics:createSelfHealingAction', {
        actionType,
        providerId,
        details,
        severity,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to log self-healing action:', error);
    }
  }

  private async logCircuitBreakerMetrics(circuitBreaker: any, providerId: string): Promise<void> {
    try {
      const metrics = circuitBreaker.getMetrics();
      await convexService.client.mutation('selfHealingMetrics:createCircuitBreakerMetric', {
        providerId,
        name: circuitBreaker.name,
        ...metrics
      });
    } catch (error) {
      console.error('Failed to log circuit breaker metrics:', error);
    }
  }

  private async logFailoverEvent(failoverResult: any, operationName: string): Promise<void> {
    try {
      await convexService.client.mutation('selfHealingMetrics:createFailoverEvent', {
        operationName,
        primaryProviderId: failoverResult.attempts[0]?.providerId || '',
        failoverProviderId: failoverResult.providerId,
        strategy: 'PRIORITY_BASED',
        totalAttempts: failoverResult.totalAttempts,
        success: failoverResult.success,
        totalLatency: failoverResult.totalLatency,
        fallbackUsed: failoverResult.fallbackUsed,
        cacheUsed: failoverResult.cacheUsed,
        attempts: failoverResult.attempts
      });
    } catch (error) {
      console.error('Failed to log failover event:', error);
    }
  }

  private async logAnomaly(
    providerId: string,
    anomalyType: string,
    baseline: any,
    current: any
  ): Promise<void> {
    try {
      const deviation = Math.abs(current.averageLatency - baseline.averageLatency) / baseline.averageLatency;
      const confidence = Math.min(1, deviation);
      
      await convexService.client.mutation('selfHealingMetrics:createAnomalyDetection', {
        providerId,
        anomalyType,
        severity: deviation > 0.5 ? 'HIGH' : 'MEDIUM',
        confidence,
        baseline,
        current,
        deviation
      });
    } catch (error) {
      console.error('Failed to log anomaly:', error);
    }
  }

  // Public methods
  async getSelfHealingStats(): Promise<any> {
    try {
      return await convexService.client.query('selfHealingMetrics:getSelfHealingStats', {
        since: Date.now() - 24 * 60 * 60 * 1000
      });
    } catch (error) {
      console.error('Failed to get self-healing stats:', error);
      return null;
    }
  }

  async resetAllSystems(): Promise<void> {
    circuitBreakerService.resetAll();
    retryService.resetMetrics();
    failoverService.resetProviderHealth();
    this.providerBaselines.clear();
    
    await this.logSelfHealingAction('SYSTEM_RESET', {
      reason: 'All self-healing systems reset manually'
    }, 'INFO');
  }
}

// Singleton instance
export const selfHealingService = new SelfHealingService();
