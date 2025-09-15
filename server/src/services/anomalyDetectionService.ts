import { EventEmitter } from 'events';
import { convexService } from './convexService.js';
import { ApiProvider } from '../types/index.js';

export interface AnomalyThresholds {
  latencyMultiplier: number;
  errorRateThreshold: number;
  availabilityThreshold: number;
  confidenceThreshold: number;
}

export interface ProviderBaseline {
  providerId: string;
  averageLatency: number;
  errorRate: number;
  availability: number;
  requestVolume: number;
  lastUpdated: number;
  sampleSize: number;
}

export interface AnomalyResult {
  providerId: string;
  anomalyType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  deviation: number;
  baseline: ProviderBaseline;
  current: {
    averageLatency: number;
    errorRate: number;
    availability: number;
  };
  recommendation: string;
}

export class AnomalyDetectionService extends EventEmitter {
  private baselines = new Map<string, ProviderBaseline>();
  private adaptiveThresholds = new Map<string, AnomalyThresholds>();
  private learningHistory = new Map<string, Array<{
    timestamp: number;
    latency: number;
    errorRate: number;
    availability: number;
  }>>();

  private defaultThresholds: AnomalyThresholds = {
    latencyMultiplier: 2.0,
    errorRateThreshold: 0.1,
    availabilityThreshold: 0.95,
    confidenceThreshold: 0.7
  };

  private readonly LEARNING_WINDOW = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MIN_SAMPLES = 50; // Minimum samples for reliable baseline
  private readonly ADAPTATION_RATE = 0.1; // How quickly to adapt thresholds

  async detectAnomalies(providers: ApiProvider[]): Promise<AnomalyResult[]> {
    const anomalies: AnomalyResult[] = [];

    for (const provider of providers) {
      try {
        // Update baseline if needed
        await this.updateBaseline(provider._id!);
        
        const baseline = this.baselines.get(provider._id!);
        if (!baseline || baseline.sampleSize < this.MIN_SAMPLES) {
          continue; // Not enough data for reliable detection
        }

        const current = {
          averageLatency: provider.latency,
          errorRate: provider.errorRate,
          availability: provider.isHealthy ? 1 : 0
        };

        // Get adaptive thresholds for this provider
        const thresholds = this.getAdaptiveThresholds(provider._id!);

        // Detect latency anomalies
        const latencyAnomaly = this.detectLatencyAnomaly(baseline, current, thresholds);
        if (latencyAnomaly) {
          anomalies.push(latencyAnomaly);
        }

        // Detect error rate anomalies
        const errorRateAnomaly = this.detectErrorRateAnomaly(baseline, current, thresholds);
        if (errorRateAnomaly) {
          anomalies.push(errorRateAnomaly);
        }

        // Detect availability anomalies
        const availabilityAnomaly = this.detectAvailabilityAnomaly(baseline, current, thresholds);
        if (availabilityAnomaly) {
          anomalies.push(availabilityAnomaly);
        }

        // Learn from current data
        this.addLearningData(provider._id!, current);

      } catch (error) {
        console.error(`Error detecting anomalies for provider ${provider._id}:`, error);
      }
    }

    // Adapt thresholds based on recent performance
    await this.adaptThresholds();

    return anomalies;
  }

  private detectLatencyAnomaly(
    baseline: ProviderBaseline,
    current: any,
    thresholds: AnomalyThresholds
  ): AnomalyResult | null {
    if (baseline.averageLatency === 0) return null;

    const latencyRatio = current.averageLatency / baseline.averageLatency;
    const deviation = Math.abs(latencyRatio - 1);

    if (latencyRatio > thresholds.latencyMultiplier) {
      const confidence = Math.min(1, deviation / thresholds.latencyMultiplier);
      
      if (confidence >= thresholds.confidenceThreshold) {
        return {
          providerId: baseline.providerId,
          anomalyType: 'LATENCY_SPIKE',
          severity: this.calculateSeverity(deviation),
          confidence,
          deviation,
          baseline,
          current,
          recommendation: this.generateLatencyRecommendation(latencyRatio)
        };
      }
    }

    return null;
  }

  private detectErrorRateAnomaly(
    baseline: ProviderBaseline,
    current: any,
    thresholds: AnomalyThresholds
  ): AnomalyResult | null {
    const errorRateIncrease = current.errorRate - baseline.errorRate;
    
    if (current.errorRate > thresholds.errorRateThreshold && errorRateIncrease > 0.05) {
      const confidence = Math.min(1, errorRateIncrease / thresholds.errorRateThreshold);
      
      if (confidence >= thresholds.confidenceThreshold) {
        return {
          providerId: baseline.providerId,
          anomalyType: 'ERROR_RATE_INCREASE',
          severity: this.calculateSeverity(errorRateIncrease * 10), // Scale for severity
          confidence,
          deviation: errorRateIncrease,
          baseline,
          current,
          recommendation: this.generateErrorRateRecommendation(current.errorRate)
        };
      }
    }

    return null;
  }

  private detectAvailabilityAnomaly(
    baseline: ProviderBaseline,
    current: any,
    thresholds: AnomalyThresholds
  ): AnomalyResult | null {
    const availabilityDrop = baseline.availability - current.availability;
    
    if (current.availability < thresholds.availabilityThreshold && availabilityDrop > 0.1) {
      const confidence = Math.min(1, availabilityDrop / (1 - thresholds.availabilityThreshold));
      
      if (confidence >= thresholds.confidenceThreshold) {
        return {
          providerId: baseline.providerId,
          anomalyType: 'AVAILABILITY_DROP',
          severity: this.calculateSeverity(availabilityDrop * 5), // Scale for severity
          confidence,
          deviation: availabilityDrop,
          baseline,
          current,
          recommendation: this.generateAvailabilityRecommendation(current.availability)
        };
      }
    }

    return null;
  }

  private calculateSeverity(deviation: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (deviation > 2.0) return 'CRITICAL';
    if (deviation > 1.0) return 'HIGH';
    if (deviation > 0.5) return 'MEDIUM';
    return 'LOW';
  }

  private generateLatencyRecommendation(latencyRatio: number): string {
    if (latencyRatio > 5) return 'Critical latency spike detected. Consider immediate failover.';
    if (latencyRatio > 3) return 'High latency detected. Monitor closely and prepare for failover.';
    if (latencyRatio > 2) return 'Elevated latency detected. Check provider health.';
    return 'Minor latency increase detected. Continue monitoring.';
  }

  private generateErrorRateRecommendation(errorRate: number): string {
    if (errorRate > 0.5) return 'Critical error rate. Immediate failover recommended.';
    if (errorRate > 0.2) return 'High error rate. Consider circuit breaker activation.';
    if (errorRate > 0.1) return 'Elevated error rate. Increase monitoring frequency.';
    return 'Minor error rate increase. Continue monitoring.';
  }

  private generateAvailabilityRecommendation(availability: number): string {
    if (availability < 0.5) return 'Critical availability drop. Immediate failover required.';
    if (availability < 0.8) return 'Low availability. Activate backup providers.';
    if (availability < 0.95) return 'Reduced availability. Monitor closely.';
    return 'Minor availability reduction. Continue monitoring.';
  }

  private async updateBaseline(providerId: string): Promise<void> {
    try {
      const since = Date.now() - this.LEARNING_WINDOW;
      const stats = await convexService.getHealthCheckStats(providerId, since);
      
      if (stats.totalChecks > 0) {
        const baseline: ProviderBaseline = {
          providerId,
          averageLatency: stats.averageLatency,
          errorRate: 1 - stats.uptime,
          availability: stats.uptime,
          requestVolume: stats.totalChecks,
          lastUpdated: Date.now(),
          sampleSize: stats.totalChecks
        };

        this.baselines.set(providerId, baseline);
      }
    } catch (error) {
      console.error(`Failed to update baseline for provider ${providerId}:`, error);
    }
  }

  private getAdaptiveThresholds(providerId: string): AnomalyThresholds {
    return this.adaptiveThresholds.get(providerId) || { ...this.defaultThresholds };
  }

  private addLearningData(providerId: string, current: any): void {
    if (!this.learningHistory.has(providerId)) {
      this.learningHistory.set(providerId, []);
    }

    const history = this.learningHistory.get(providerId)!;
    history.push({
      timestamp: Date.now(),
      latency: current.averageLatency,
      errorRate: current.errorRate,
      availability: current.availability
    });

    // Keep only recent data
    const cutoff = Date.now() - this.LEARNING_WINDOW;
    this.learningHistory.set(
      providerId,
      history.filter(entry => entry.timestamp > cutoff)
    );
  }

  private async adaptThresholds(): Promise<void> {
    for (const [providerId, history] of this.learningHistory) {
      if (history.length < this.MIN_SAMPLES) continue;

      try {
        // Calculate variance and adjust thresholds
        const latencyVariance = this.calculateVariance(history.map(h => h.latency));
        const errorRateVariance = this.calculateVariance(history.map(h => h.errorRate));
        
        const currentThresholds = this.getAdaptiveThresholds(providerId);
        
        // Adapt latency multiplier based on variance
        const targetLatencyMultiplier = Math.max(1.5, Math.min(3.0, 1.5 + latencyVariance));
        currentThresholds.latencyMultiplier = this.lerp(
          currentThresholds.latencyMultiplier,
          targetLatencyMultiplier,
          this.ADAPTATION_RATE
        );

        // Adapt error rate threshold based on historical performance
        const avgErrorRate = history.reduce((sum, h) => sum + h.errorRate, 0) / history.length;
        const targetErrorThreshold = Math.max(0.05, Math.min(0.2, avgErrorRate * 2));
        currentThresholds.errorRateThreshold = this.lerp(
          currentThresholds.errorRateThreshold,
          targetErrorThreshold,
          this.ADAPTATION_RATE
        );

        this.adaptiveThresholds.set(providerId, currentThresholds);

      } catch (error) {
        console.error(`Failed to adapt thresholds for provider ${providerId}:`, error);
      }
    }
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private lerp(current: number, target: number, rate: number): number {
    return current + (target - current) * rate;
  }

  // Public methods
  async getProviderBaseline(providerId: string): Promise<ProviderBaseline | null> {
    await this.updateBaseline(providerId);
    return this.baselines.get(providerId) || null;
  }

  getAdaptiveThresholdsForProvider(providerId: string): AnomalyThresholds {
    return this.getAdaptiveThresholds(providerId);
  }

  resetLearning(providerId?: string): void {
    if (providerId) {
      this.baselines.delete(providerId);
      this.adaptiveThresholds.delete(providerId);
      this.learningHistory.delete(providerId);
    } else {
      this.baselines.clear();
      this.adaptiveThresholds.clear();
      this.learningHistory.clear();
    }
  }
}

// Singleton instance
export const anomalyDetectionService = new AnomalyDetectionService();
