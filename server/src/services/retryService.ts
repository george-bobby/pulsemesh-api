import { EventEmitter } from 'events';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;        // Base delay in ms
  maxDelay: number;         // Maximum delay in ms
  backoffMultiplier: number; // Exponential backoff multiplier
  jitterMax: number;        // Maximum jitter in ms
  retryableErrors: string[]; // Error types that should trigger retry
}

export interface RetryAttempt {
  attemptNumber: number;
  delay: number;
  error?: Error;
  timestamp: number;
}

export interface RetryMetrics {
  totalAttempts: number;
  successfulRetries: number;
  failedRetries: number;
  averageAttempts: number;
  lastAttemptTime: number | null;
}

export class RetryService extends EventEmitter {
  private metrics: Map<string, RetryMetrics> = new Map();
  
  private defaultConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitterMax: 1000,
    retryableErrors: [
      'ECONNRESET',
      'ECONNREFUSED', 
      'ETIMEDOUT',
      'ENOTFOUND',
      'EAI_AGAIN',
      'NETWORK_ERROR',
      'TIMEOUT_ERROR'
    ]
  };

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const attempts: RetryAttempt[] = [];
    let lastError: Error;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      const attemptStart = Date.now();
      
      try {
        const result = await operation();
        
        // Success - update metrics
        this.updateMetrics(operationName, attempt, true);
        
        if (attempt > 1) {
          this.emit('retrySucceeded', {
            operationName,
            attempt,
            totalAttempts: attempt,
            attempts
          });
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        const attemptInfo: RetryAttempt = {
          attemptNumber: attempt,
          delay: 0,
          error: lastError,
          timestamp: attemptStart
        };
        
        attempts.push(attemptInfo);
        
        // Check if this error is retryable
        if (!this.isRetryableError(lastError, finalConfig.retryableErrors)) {
          this.emit('nonRetryableError', {
            operationName,
            error: lastError,
            attempt
          });
          throw lastError;
        }
        
        // If this was the last attempt, don't wait
        if (attempt === finalConfig.maxAttempts) {
          this.updateMetrics(operationName, attempt, false);
          break;
        }
        
        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, finalConfig);
        attemptInfo.delay = delay;
        
        this.emit('retryAttempt', {
          operationName,
          attempt,
          error: lastError,
          delay,
          nextAttempt: attempt + 1
        });
        
        // Wait before next attempt
        await this.sleep(delay);
      }
    }
    
    // All attempts failed
    this.updateMetrics(operationName, finalConfig.maxAttempts, false);
    
    this.emit('retryFailed', {
      operationName,
      totalAttempts: finalConfig.maxAttempts,
      attempts,
      finalError: lastError
    });
    
    throw new Error(
      `Operation ${operationName} failed after ${finalConfig.maxAttempts} attempts. Last error: ${lastError.message}`
    );
  }

  private isRetryableError(error: Error, retryableErrors: string[]): boolean {
    const errorMessage = error.message.toLowerCase();
    const errorCode = (error as any).code;
    
    // Check error code first
    if (errorCode && retryableErrors.includes(errorCode)) {
      return true;
    }
    
    // Check error message for known patterns
    return retryableErrors.some(pattern => 
      errorMessage.includes(pattern.toLowerCase()) ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('network')
    );
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    // Exponential backoff: baseDelay * (backoffMultiplier ^ (attempt - 1))
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    
    // Apply maximum delay limit
    const cappedDelay = Math.min(exponentialDelay, config.maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * config.jitterMax;
    
    return Math.floor(cappedDelay + jitter);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateMetrics(operationName: string, attempts: number, success: boolean): void {
    if (!this.metrics.has(operationName)) {
      this.metrics.set(operationName, {
        totalAttempts: 0,
        successfulRetries: 0,
        failedRetries: 0,
        averageAttempts: 0,
        lastAttemptTime: null
      });
    }
    
    const metrics = this.metrics.get(operationName)!;
    metrics.totalAttempts++;
    metrics.lastAttemptTime = Date.now();
    
    if (success) {
      if (attempts > 1) {
        metrics.successfulRetries++;
      }
    } else {
      metrics.failedRetries++;
    }
    
    // Update average attempts
    const totalOperations = metrics.successfulRetries + metrics.failedRetries + 
                           (metrics.totalAttempts - metrics.successfulRetries - metrics.failedRetries);
    if (totalOperations > 0) {
      metrics.averageAttempts = metrics.totalAttempts / totalOperations;
    }
  }

  // Public methods for metrics and management
  getMetrics(operationName?: string): RetryMetrics | Record<string, RetryMetrics> {
    if (operationName) {
      return this.metrics.get(operationName) || {
        totalAttempts: 0,
        successfulRetries: 0,
        failedRetries: 0,
        averageAttempts: 0,
        lastAttemptTime: null
      };
    }
    
    const allMetrics: Record<string, RetryMetrics> = {};
    for (const [name, metrics] of this.metrics) {
      allMetrics[name] = { ...metrics };
    }
    return allMetrics;
  }

  resetMetrics(operationName?: string): void {
    if (operationName) {
      this.metrics.delete(operationName);
    } else {
      this.metrics.clear();
    }
  }

  // Utility method to create operation-specific retry functions
  createRetryFunction<T>(
    operationName: string,
    config?: Partial<RetryConfig>
  ): (operation: () => Promise<T>) => Promise<T> {
    return (operation: () => Promise<T>) => 
      this.executeWithRetry(operation, operationName, config);
  }

  // Batch retry for multiple operations
  async executeMultipleWithRetry<T>(
    operations: Array<{
      operation: () => Promise<T>;
      name: string;
      config?: Partial<RetryConfig>;
    }>,
    concurrency: number = 3
  ): Promise<Array<{ name: string; result?: T; error?: Error }>> {
    const results: Array<{ name: string; result?: T; error?: Error }> = [];
    
    // Process operations in batches to control concurrency
    for (let i = 0; i < operations.length; i += concurrency) {
      const batch = operations.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async ({ operation, name, config }) => {
        try {
          const result = await this.executeWithRetry(operation, name, config);
          return { name, result };
        } catch (error) {
          return { name, error: error as Error };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
}

// Singleton instance
export const retryService = new RetryService();
