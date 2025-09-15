#!/usr/bin/env tsx

/**
 * Self-Healing API Demo Script
 * 
 * This script demonstrates the comprehensive self-healing capabilities
 * of the PulseMesh API monitoring system.
 */

import { circuitBreakerService } from '../src/services/circuitBreakerService.js';
import { retryService } from '../src/services/retryService.js';
import { failoverService } from '../src/services/failoverService.js';
import { selfHealingService } from '../src/services/selfHealingService.js';
import { anomalyDetectionService } from '../src/services/anomalyDetectionService.js';

// Mock API provider for demonstration
const mockProvider = {
  _id: 'demo-provider-1',
  name: 'Demo API Provider',
  type: 'REST',
  endpoint: 'https://httpbin.org/status/200',
  isHealthy: true,
  latency: 100,
  errorRate: 0.05,
  priority: 1,
  isPrimary: true,
  lastCheck: new Date().toISOString(),
  userId: 'demo-user'
};

const failingProvider = {
  _id: 'demo-provider-2',
  name: 'Failing API Provider',
  type: 'REST',
  endpoint: 'https://httpbin.org/status/500',
  isHealthy: false,
  latency: 5000,
  errorRate: 0.8,
  priority: 2,
  isPrimary: false,
  lastCheck: new Date().toISOString(),
  userId: 'demo-user'
};

async function simulateApiCall(provider: any): Promise<string> {
  // Simulate different response scenarios
  if (provider.endpoint.includes('500')) {
    throw new Error('Internal Server Error');
  }
  if (provider.endpoint.includes('timeout')) {
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  // Simulate latency
  await new Promise(resolve => setTimeout(resolve, provider.latency));
  
  return `Success response from ${provider.name}`;
}

async function demonstrateCircuitBreaker() {
  console.log('\n🔧 === CIRCUIT BREAKER DEMONSTRATION ===');
  
  const circuitBreaker = circuitBreakerService.getOrCreateCircuitBreaker(
    'demo-circuit-breaker',
    {
      failureThreshold: 3,
      recoveryTimeout: 5000,
      successThreshold: 2,
      timeout: 1000,
      monitoringPeriod: 10000
    }
  );

  console.log('Initial state:', circuitBreaker.getState());

  // Simulate failures to trigger circuit breaker
  console.log('\n📉 Simulating failures...');
  for (let i = 1; i <= 5; i++) {
    try {
      await circuitBreaker.execute(async () => {
        throw new Error(`Simulated failure ${i}`);
      });
    } catch (error) {
      console.log(`Attempt ${i}: ${error.message}`);
      console.log(`Circuit breaker state: ${circuitBreaker.getState()}`);
    }
  }

  console.log('\n📊 Circuit breaker metrics:', circuitBreaker.getMetrics());
}

async function demonstrateRetryMechanism() {
  console.log('\n🔄 === RETRY MECHANISM DEMONSTRATION ===');

  let attemptCount = 0;
  
  try {
    const result = await retryService.executeWithRetry(
      async () => {
        attemptCount++;
        console.log(`Attempt ${attemptCount}`);
        
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        
        return 'Success after retries!';
      },
      'demo-retry-operation',
      {
        maxAttempts: 5,
        baseDelay: 1000,
        backoffMultiplier: 2,
        jitterMax: 500
      }
    );
    
    console.log('✅ Final result:', result);
  } catch (error) {
    console.log('❌ All retries failed:', error.message);
  }

  console.log('\n📊 Retry metrics:', retryService.getMetrics('demo-retry-operation'));
}

async function demonstrateFailover() {
  console.log('\n🔀 === FAILOVER DEMONSTRATION ===');

  const providers = [failingProvider, mockProvider];

  try {
    const result = await failoverService.executeWithFailover(
      providers,
      simulateApiCall,
      'demo-failover-operation',
      {
        strategy: 'PRIORITY_BASED',
        maxFailoverAttempts: 2,
        failoverCooldown: 1000,
        healthThreshold: 0.5,
        latencyThreshold: 3000,
        enableCaching: true,
        cacheTimeout: 60000
      },
      'demo-cache-key'
    );

    console.log('✅ Failover result:', result);
  } catch (error) {
    console.log('❌ Failover failed:', error.message);
  }

  console.log('\n📊 Provider health status:');
  const healthMap = failoverService.getProviderHealth();
  for (const [providerId, health] of healthMap) {
    console.log(`${providerId}:`, health);
  }
}

async function demonstrateAnomalyDetection() {
  console.log('\n🚨 === ANOMALY DETECTION DEMONSTRATION ===');

  // Create providers with different health patterns
  const healthyProvider = { ...mockProvider, latency: 100, errorRate: 0.01 };
  const degradedProvider = { ...mockProvider, _id: 'degraded', latency: 2000, errorRate: 0.15 };
  const unhealthyProvider = { ...failingProvider, latency: 8000, errorRate: 0.9 };

  const providers = [healthyProvider, degradedProvider, unhealthyProvider];

  try {
    const anomalies = await anomalyDetectionService.detectAnomalies(providers);
    
    console.log(`🔍 Detected ${anomalies.length} anomalies:`);
    
    for (const anomaly of anomalies) {
      console.log(`\n📊 Anomaly: ${anomaly.anomalyType}`);
      console.log(`   Provider: ${anomaly.providerId}`);
      console.log(`   Severity: ${anomaly.severity}`);
      console.log(`   Confidence: ${(anomaly.confidence * 100).toFixed(1)}%`);
      console.log(`   Recommendation: ${anomaly.recommendation}`);
    }
  } catch (error) {
    console.log('❌ Anomaly detection failed:', error.message);
  }
}

async function demonstrateComprehensiveSelfHealing() {
  console.log('\n🏥 === COMPREHENSIVE SELF-HEALING DEMONSTRATION ===');

  const providers = [failingProvider, mockProvider];

  try {
    const result = await selfHealingService.executeWithSelfHealing(
      providers,
      simulateApiCall,
      'demo-comprehensive-healing',
      {
        enableCircuitBreaker: true,
        enableRetry: true,
        enableFailover: true,
        enableAnomalyDetection: true,
        anomalyThresholds: {
          latencyMultiplier: 2.0,
          errorRateThreshold: 0.1,
          availabilityThreshold: 0.95
        }
      }
    );

    console.log('✅ Self-healing result:', {
      success: result.success,
      actionsPerformed: result.actionsPerformed,
      providersUsed: result.providersUsed,
      totalLatency: result.totalLatency,
      fallbackUsed: result.fallbackUsed,
      cacheUsed: result.cacheUsed,
      anomaliesDetected: result.anomaliesDetected
    });

  } catch (error) {
    console.log('❌ Self-healing failed:', error.message);
  }
}

async function demonstrateAdaptiveLearning() {
  console.log('\n🧠 === ADAPTIVE LEARNING DEMONSTRATION ===');

  // Simulate learning from historical data
  const providerId = 'demo-provider-1';
  
  try {
    const baseline = await anomalyDetectionService.getProviderBaseline(providerId);
    console.log('📊 Provider baseline:', baseline);

    const thresholds = anomalyDetectionService.getAdaptiveThresholdsForProvider(providerId);
    console.log('🎯 Adaptive thresholds:', thresholds);

    console.log('🔄 Simulating learning process...');
    // The learning happens automatically as data is processed
    
  } catch (error) {
    console.log('❌ Adaptive learning demo failed:', error.message);
  }
}

async function runDemo() {
  console.log('🚀 Starting PulseMesh Self-Healing API Demo');
  console.log('=' .repeat(50));

  try {
    await demonstrateCircuitBreaker();
    await demonstrateRetryMechanism();
    await demonstrateFailover();
    await demonstrateAnomalyDetection();
    await demonstrateComprehensiveSelfHealing();
    await demonstrateAdaptiveLearning();

    console.log('\n🎉 === DEMO COMPLETED SUCCESSFULLY ===');
    console.log('\nKey Features Demonstrated:');
    console.log('✅ Circuit Breaker Pattern - Automatic failure isolation');
    console.log('✅ Intelligent Retry Logic - Exponential backoff with jitter');
    console.log('✅ Smart Failover - Priority-based provider switching');
    console.log('✅ Anomaly Detection - ML-driven pattern recognition');
    console.log('✅ Comprehensive Self-Healing - Coordinated recovery strategies');
    console.log('✅ Adaptive Learning - Dynamic threshold adjustment');
    
    console.log('\n📈 Benefits:');
    console.log('• Automatic failure detection and recovery');
    console.log('• Reduced downtime through intelligent failover');
    console.log('• Improved reliability with circuit breaker protection');
    console.log('• Enhanced observability with detailed metrics');
    console.log('• Adaptive behavior based on historical patterns');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export { runDemo };
