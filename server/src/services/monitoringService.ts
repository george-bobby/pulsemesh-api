import * as cron from "node-cron";
import axios, { AxiosResponse } from "axios";
import { convexService } from "./convexService.js";
import { env } from "../config/env.js";
import {
  ApiProvider,
  HealthCheckResult,
  CircuitBreakerState,
  CircuitBreakerConfig,
} from "../types/index.js";

export class MonitoringService {
  private isRunning = false;
  private cronJob: cron.ScheduledTask | null = null;
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private circuitBreakerConfig: CircuitBreakerConfig;
  private failureCounts = new Map<string, number>();
  private lastFailureTime = new Map<string, number>();
  constructor() {
    this.circuitBreakerConfig = {
      failureThreshold: env.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
      timeout: env.CIRCUIT_BREAKER_TIMEOUT,
      resetTimeout: env.CIRCUIT_BREAKER_RESET_TIMEOUT,
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("Monitoring service is already running");
      return;
    }

    console.log("Starting monitoring service...");

    // Schedule monitoring checks
    const intervalSeconds = Math.floor(env.MONITORING_INTERVAL / 1000);
    const cronExpression = `*/${intervalSeconds} * * * * *`;

    this.cronJob = cron.schedule(
      cronExpression,
      async () => {
        await this.performHealthChecks();
      },
      {
        scheduled: false,
      }
    );

    this.cronJob.start();
    this.isRunning = true;

    // Perform initial health check
    await this.performHealthChecks();

    console.log(`Monitoring service started with ${intervalSeconds}s interval`);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log("Stopping monitoring service...");

    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }

    this.isRunning = false;
    console.log("Monitoring service stopped");
  }

  private async performHealthChecks(): Promise<void> {
    try {
      const providers = await convexService.getAllApiProviders();

      if (providers.length === 0) {
        return;
      }

      console.log(`Performing health checks for ${providers.length} providers`);

      // Limit concurrent checks
      const chunks = this.chunkArray(providers, env.MAX_CONCURRENT_CHECKS);

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map((provider) => this.checkProviderHealth(provider))
        );
      }
    } catch (error) {
      console.error("Error performing health checks:", error);
    }
  }

  private async checkProviderHealth(provider: ApiProvider): Promise<void> {
    const startTime = Date.now();
    let result: HealthCheckResult;

    try {
      // Check circuit breaker state
      const circuitState = this.getCircuitBreakerState(provider._id!);

      if (circuitState === CircuitBreakerState.OPEN) {
        // Circuit is open, fail fast
        result = {
          providerId: provider._id!,
          timestamp: Date.now(),
          isHealthy: false,
          latency: 0,
          responseTime: 0,
          errorMessage: "Circuit breaker is open",
        };
      } else {
        // Perform actual health check
        result = await this.performHttpCheck(provider, startTime);

        // Update circuit breaker based on result
        this.updateCircuitBreaker(provider._id!, result.isHealthy);
      }

      // Store result in database
      await convexService.createHealthCheckResult(result);

      // Update provider health status
      await convexService.updateProviderHealth(provider._id!, {
        isHealthy: result.isHealthy,
        latency: result.latency,
        lastCheck: new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        `Health check failed for provider ${provider.name}:`,
        error
      );

      // Create error result
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      result = {
        providerId: provider._id!,
        timestamp: Date.now(),
        isHealthy: false,
        latency: Date.now() - startTime,
        responseTime: Date.now() - startTime,
        errorMessage,
      };

      // Store error result
      try {
        await convexService.createHealthCheckResult(result);
        await convexService.updateProviderHealth(provider._id!, {
          isHealthy: false,
          latency: result.latency,
          lastCheck: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error("Failed to store error result:", dbError);
      }
    }
  }

  private async performHttpCheck(
    provider: ApiProvider,
    startTime: number
  ): Promise<HealthCheckResult> {
    try {
      // First, try a basic connectivity test
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        env.MONITORING_TIMEOUT
      );

      const response: AxiosResponse = await axios.get(provider.endpoint, {
        timeout: env.MONITORING_TIMEOUT,
        validateStatus: (status) => status < 500, // Consider 4xx as healthy but 5xx as unhealthy
        signal: controller.signal,
        headers: {
          "User-Agent": "PulseMesh-Monitor/1.0",
          Accept: "application/json, text/plain, */*",
        },
      });

      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Consider 2xx and 3xx as healthy, 4xx as degraded, 5xx as down
      let isHealthy = true;
      if (response.status >= 500) {
        isHealthy = false;
      } else if (response.status >= 400) {
        // 4xx could still be considered "healthy" if the endpoint is responding
        isHealthy = true; // The API is responding, just might need authentication
      }

      console.log(
        `Health check for ${provider.name}: ${response.status} in ${responseTime}ms`
      );

      return {
        providerId: provider._id!,
        timestamp: endTime,
        isHealthy,
        latency: responseTime,
        statusCode: response.status,
        responseTime,
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Type guards for error handling
      const isAxiosError =
        error && typeof error === "object" && "response" in error;
      const isNodeError = error && typeof error === "object" && "code" in error;
      const isError = error instanceof Error;

      // Get error details safely
      const errorCode = isNodeError ? (error as any).code : undefined;
      const errorName = isError ? error.name : undefined;
      const errorMessage = isError ? error.message : "Unknown error";
      const statusCode = isAxiosError
        ? (error as any).response?.status
        : undefined;

      // Log the error for debugging
      console.warn(
        `Health check failed for ${provider.name} (${provider.endpoint}):`,
        errorCode || errorMessage
      );

      // Determine if this is a network error or API error
      const isNetworkError =
        errorCode === "ECONNREFUSED" ||
        errorCode === "ENOTFOUND" ||
        errorCode === "ETIMEDOUT" ||
        errorName === "AbortError";

      return {
        providerId: provider._id!,
        timestamp: endTime,
        isHealthy: false,
        latency: responseTime,
        responseTime,
        errorMessage: isNetworkError
          ? `Network error: ${errorCode || "Connection failed"}`
          : errorMessage,
        statusCode,
      };
    }
  }

  private getCircuitBreakerState(providerId: string): CircuitBreakerState {
    const currentState =
      this.circuitBreakers.get(providerId) || CircuitBreakerState.CLOSED;
    const failureCount = this.failureCounts.get(providerId) || 0;
    const lastFailure = this.lastFailureTime.get(providerId) || 0;
    const now = Date.now();

    if (currentState === CircuitBreakerState.OPEN) {
      // Check if we should transition to half-open
      if (now - lastFailure > this.circuitBreakerConfig.resetTimeout) {
        this.circuitBreakers.set(providerId, CircuitBreakerState.HALF_OPEN);
        return CircuitBreakerState.HALF_OPEN;
      }
      return CircuitBreakerState.OPEN;
    }

    if (currentState === CircuitBreakerState.HALF_OPEN) {
      return CircuitBreakerState.HALF_OPEN;
    }

    // Check if we should open the circuit
    if (failureCount >= this.circuitBreakerConfig.failureThreshold) {
      this.circuitBreakers.set(providerId, CircuitBreakerState.OPEN);
      this.lastFailureTime.set(providerId, now);
      return CircuitBreakerState.OPEN;
    }

    return CircuitBreakerState.CLOSED;
  }

  private updateCircuitBreaker(providerId: string, isHealthy: boolean): void {
    const currentState =
      this.circuitBreakers.get(providerId) || CircuitBreakerState.CLOSED;
    const failureCount = this.failureCounts.get(providerId) || 0;

    if (isHealthy) {
      // Reset failure count on success
      this.failureCounts.set(providerId, 0);

      if (currentState === CircuitBreakerState.HALF_OPEN) {
        // Transition back to closed
        this.circuitBreakers.set(providerId, CircuitBreakerState.CLOSED);
      }
    } else {
      // Increment failure count
      this.failureCounts.set(providerId, failureCount + 1);
      this.lastFailureTime.set(providerId, Date.now());

      if (currentState === CircuitBreakerState.HALF_OPEN) {
        // Transition back to open
        this.circuitBreakers.set(providerId, CircuitBreakerState.OPEN);
      }
    }
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Public methods for manual health checks
  async checkProvider(providerId: string): Promise<HealthCheckResult> {
    const provider = await convexService.getApiProvider(providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    const startTime = Date.now();
    return await this.performHttpCheck(provider, startTime);
  }

  getCircuitBreakerStatus(providerId: string): {
    state: CircuitBreakerState;
    failureCount: number;
    lastFailure: number | null;
  } {
    return {
      state: this.circuitBreakers.get(providerId) || CircuitBreakerState.CLOSED,
      failureCount: this.failureCounts.get(providerId) || 0,
      lastFailure: this.lastFailureTime.get(providerId) || null,
    };
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();
