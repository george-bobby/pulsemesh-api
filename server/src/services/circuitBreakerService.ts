import { EventEmitter } from 'events';

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing fast
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

export interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening
  recoveryTimeout: number;       // Time to wait before trying half-open (ms)
  successThreshold: number;      // Successes needed to close from half-open
  timeout: number;              // Request timeout (ms)
  monitoringPeriod: number;     // Time window for failure counting (ms)
}

export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
  stateChangedAt: number;
  nextAttemptAt: number | null;
}

export class CircuitBreaker extends EventEmitter {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private totalRequests = 0;
  private totalFailures = 0;
  private totalSuccesses = 0;
  private stateChangedAt = Date.now();
  private nextAttemptAt: number | null = null;
  private recentFailures: number[] = []; // Timestamps of recent failures

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig
  ) {
    super();
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalRequests++;
    
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.moveToHalfOpen();
      } else {
        this.emit('callRejected', { name: this.name, reason: 'Circuit breaker is OPEN' });
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    try {
      const result = await Promise.race([
        operation(),
        this.createTimeoutPromise()
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private createTimeoutPromise<T>(): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);
    });
  }

  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.totalSuccesses++;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.moveToClosed();
      }
    } else if (this.state === CircuitBreakerState.CLOSED) {
      // Reset failure count on success in closed state
      this.failureCount = 0;
      this.recentFailures = [];
    }

    this.emit('callSucceeded', { name: this.name, state: this.state });
  }

  private onFailure(): void {
    this.lastFailureTime = Date.now();
    this.totalFailures++;
    this.failureCount++;
    this.recentFailures.push(Date.now());
    
    // Clean old failures outside monitoring period
    this.cleanOldFailures();

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.moveToOpen();
    } else if (this.state === CircuitBreakerState.CLOSED) {
      if (this.recentFailures.length >= this.config.failureThreshold) {
        this.moveToOpen();
      }
    }

    this.emit('callFailed', { 
      name: this.name, 
      state: this.state, 
      failureCount: this.failureCount,
      recentFailures: this.recentFailures.length
    });
  }

  private cleanOldFailures(): void {
    const cutoff = Date.now() - this.config.monitoringPeriod;
    this.recentFailures = this.recentFailures.filter(time => time > cutoff);
  }

  private shouldAttemptReset(): boolean {
    return this.nextAttemptAt !== null && Date.now() >= this.nextAttemptAt;
  }

  private moveToOpen(): void {
    this.state = CircuitBreakerState.OPEN;
    this.stateChangedAt = Date.now();
    this.nextAttemptAt = Date.now() + this.config.recoveryTimeout;
    this.successCount = 0;
    
    this.emit('stateChanged', { 
      name: this.name, 
      state: this.state, 
      nextAttemptAt: this.nextAttemptAt 
    });
  }

  private moveToHalfOpen(): void {
    this.state = CircuitBreakerState.HALF_OPEN;
    this.stateChangedAt = Date.now();
    this.nextAttemptAt = null;
    this.successCount = 0;
    
    this.emit('stateChanged', { 
      name: this.name, 
      state: this.state 
    });
  }

  private moveToClosed(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.stateChangedAt = Date.now();
    this.nextAttemptAt = null;
    this.failureCount = 0;
    this.successCount = 0;
    this.recentFailures = [];
    
    this.emit('stateChanged', { 
      name: this.name, 
      state: this.state 
    });
  }

  // Public getters
  getState(): CircuitBreakerState {
    return this.state;
  }

  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      stateChangedAt: this.stateChangedAt,
      nextAttemptAt: this.nextAttemptAt
    };
  }

  // Force state changes (for testing/manual intervention)
  forceOpen(): void {
    this.moveToOpen();
  }

  forceClosed(): void {
    this.moveToClosed();
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.totalRequests = 0;
    this.totalFailures = 0;
    this.totalSuccesses = 0;
    this.stateChangedAt = Date.now();
    this.nextAttemptAt = null;
    this.recentFailures = [];
    
    this.emit('reset', { name: this.name });
  }
}

export class CircuitBreakerService extends EventEmitter {
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    recoveryTimeout: 60000, // 1 minute
    successThreshold: 3,
    timeout: 30000, // 30 seconds
    monitoringPeriod: 300000 // 5 minutes
  };

  constructor() {
    super();
  }

  getOrCreateCircuitBreaker(
    name: string, 
    config?: Partial<CircuitBreakerConfig>
  ): CircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      const finalConfig = { ...this.defaultConfig, ...config };
      const circuitBreaker = new CircuitBreaker(name, finalConfig);
      
      // Set up event listeners for logging and metrics
      circuitBreaker.on('stateChanged', (event) => {
        console.log(`Circuit breaker ${event.name} state changed to ${event.state}`);
        // Emit the event at the service level for other services to listen
        this.emit('stateChanged', event);
      });
      
      circuitBreaker.on('callFailed', (event) => {
        console.log(`Circuit breaker ${event.name} call failed. Failure count: ${event.failureCount}`);
        // Emit the event at the service level for other services to listen
        this.emit('callFailed', event);
      });
      
      circuitBreaker.on('callRejected', (event) => {
        console.log(`Circuit breaker ${event.name} rejected call: ${event.reason}`);
        // Emit the event at the service level for other services to listen
        this.emit('callRejected', event);
      });

      this.circuitBreakers.set(name, circuitBreaker);
    }
    
    return this.circuitBreakers.get(name)!;
  }

  getCircuitBreaker(name: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(name);
  }

  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    for (const [name, breaker] of this.circuitBreakers) {
      metrics[name] = breaker.getMetrics();
    }
    return metrics;
  }

  removeCircuitBreaker(name: string): boolean {
    return this.circuitBreakers.delete(name);
  }

  resetAll(): void {
    for (const breaker of this.circuitBreakers.values()) {
      breaker.reset();
    }
  }
}

// Singleton instance
export const circuitBreakerService = new CircuitBreakerService();
