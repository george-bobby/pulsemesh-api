// Simulated API Providers for demonstration
export interface ApiProvider {
  id: string;
  name: string;
  type: "payment" | "sms" | "email" | "maps";
  endpoint: string;
  isHealthy: boolean;
  latency: number;
  errorRate: number;
  priority: number;
}

export interface ApiRequest {
  id: string;
  provider: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  errorCode?: string;
}

export interface HealthCheck {
  providerId: string;
  timestamp: Date;
  status: "healthy" | "degraded" | "down";
  latency: number;
  errorRate: number;
  details?: string;
}

// Simulated providers
export const PROVIDERS: ApiProvider[] = [
  {
    id: "stripe",
    name: "Stripe",
    type: "payment",
    endpoint: "https://api.stripe.com",
    isHealthy: true,
    latency: 125,
    errorRate: 0.1,
    priority: 1
  },
  {
    id: "paypal", 
    name: "PayPal",
    type: "payment",
    endpoint: "https://api.paypal.com",
    isHealthy: false,
    latency: 380,
    errorRate: 2.1,
    priority: 2
  },
  {
    id: "square",
    name: "Square", 
    type: "payment",
    endpoint: "https://connect.squareup.com",
    isHealthy: true,
    latency: 210,
    errorRate: 0.3,
    priority: 3
  },
  {
    id: "twilio",
    name: "Twilio",
    type: "sms", 
    endpoint: "https://api.twilio.com",
    isHealthy: false,
    latency: 0,
    errorRate: 100,
    priority: 1
  },
  {
    id: "vonage",
    name: "Vonage",
    type: "sms",
    endpoint: "https://rest.nexmo.com", 
    isHealthy: true,
    latency: 180,
    errorRate: 0.5,
    priority: 2
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    type: "email",
    endpoint: "https://api.sendgrid.com",
    isHealthy: true,
    latency: 95,
    errorRate: 0.2,
    priority: 1
  },
  {
    id: "mailgun",
    name: "Mailgun", 
    type: "email",
    endpoint: "https://api.mailgun.net",
    isHealthy: true,
    latency: 140,
    errorRate: 0.4,
    priority: 2
  },
  {
    id: "google-maps",
    name: "Google Maps",
    type: "maps",
    endpoint: "https://maps.googleapis.com",
    isHealthy: true,
    latency: 85,
    errorRate: 0.1,
    priority: 1
  }
];

class ApiResilienceManager {
  private providers: Map<string, ApiProvider> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private healthChecks: HealthCheck[] = [];
  private requests: ApiRequest[] = [];

  constructor() {
    PROVIDERS.forEach(provider => {
      this.providers.set(provider.id, provider);
      this.circuitBreakers.set(provider.id, new CircuitBreaker(provider.id));
    });
  }

  async makeRequest(type: string, data: any): Promise<{ success: boolean; provider: string; data?: any; error?: string }> {
    const availableProviders = this.getHealthyProviders(type);
    
    if (availableProviders.length === 0) {
      throw new Error(`No healthy providers available for ${type}`);
    }

    // Try providers in priority order
    for (const provider of availableProviders) {
      const circuitBreaker = this.circuitBreakers.get(provider.id)!;
      
      if (!circuitBreaker.canExecute()) {
        continue;
      }

      try {
        const result = await this.simulateApiCall(provider, data);
        circuitBreaker.onSuccess();
        
        this.logRequest({
          id: `req-${Date.now()}`,
          provider: provider.name,
          endpoint: provider.endpoint,
          method: "POST",
          timestamp: new Date(),
          duration: result.duration,
          success: true
        });

        return {
          success: true,
          provider: provider.name,
          data: result.data
        };
      } catch (error) {
        circuitBreaker.onFailure();
        
        this.logRequest({
          id: `req-${Date.now()}`,
          provider: provider.name,
          endpoint: provider.endpoint,
          method: "POST", 
          timestamp: new Date(),
          duration: 0,
          success: false,
          errorCode: "TIMEOUT"
        });

        // Continue to next provider
        continue;
      }
    }

    throw new Error("All providers failed");
  }

  private async simulateApiCall(provider: ApiProvider, data: any): Promise<{ data: any; duration: number }> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, provider.latency));
    
    // Simulate random failures based on error rate
    if (Math.random() * 100 < provider.errorRate) {
      throw new Error("API_ERROR");
    }

    return {
      data: { ...data, processedBy: provider.name },
      duration: provider.latency
    };
  }

  private getHealthyProviders(type: string): ApiProvider[] {
    return Array.from(this.providers.values())
      .filter(p => p.type === type)
      .filter(p => this.circuitBreakers.get(p.id)?.canExecute())
      .sort((a, b) => a.priority - b.priority);
  }

  performHealthCheck(providerId: string): HealthCheck {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    // Simulate health check
    const latency = provider.latency + (Math.random() - 0.5) * 50;
    const errorRate = provider.errorRate + (Math.random() - 0.5) * 0.5;
    
    let status: "healthy" | "degraded" | "down" = "healthy";
    if (errorRate > 5 || latency > 1000) {
      status = "down";
    } else if (errorRate > 1 || latency > 500) {
      status = "degraded";
    }

    const healthCheck: HealthCheck = {
      providerId,
      timestamp: new Date(),
      status,
      latency: Math.max(0, latency),
      errorRate: Math.max(0, errorRate)
    };

    this.healthChecks.push(healthCheck);
    return healthCheck;
  }

  private logRequest(request: ApiRequest): void {
    this.requests.push(request);
    // Keep only last 1000 requests
    if (this.requests.length > 1000) {
      this.requests = this.requests.slice(-1000);
    }
  }

  getProviderStats(providerId: string) {
    const recent = this.requests
      .filter(r => r.provider === this.providers.get(providerId)?.name)
      .slice(-100);
    
    const successful = recent.filter(r => r.success).length;
    const avgLatency = recent.reduce((sum, r) => sum + r.duration, 0) / recent.length || 0;
    
    return {
      totalRequests: recent.length,
      successRate: recent.length > 0 ? (successful / recent.length) * 100 : 0,
      avgLatency,
      errorRate: recent.length > 0 ? ((recent.length - successful) / recent.length) * 100 : 0
    };
  }

  getSystemOverview() {
    const allProviders = Array.from(this.providers.values());
    const healthyCount = allProviders.filter(p => 
      this.circuitBreakers.get(p.id)?.getState() === "CLOSED"
    ).length;

    const recentRequests = this.requests.slice(-100);
    const successRate = recentRequests.length > 0 
      ? (recentRequests.filter(r => r.success).length / recentRequests.length) * 100
      : 0;

    const avgLatency = recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length || 0;

    return {
      totalProviders: allProviders.length,
      healthyProviders: healthyCount,
      systemHealth: successRate,
      avgLatency,
      requestVolume: recentRequests.length
    };
  }
}

class CircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private failureCount = 0;
  private lastFailureTime?: Date;
  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 60000; // 1 minute

  constructor(private providerId: string) {}

  canExecute(): boolean {
    if (this.state === "CLOSED") {
      return true;
    }

    if (this.state === "OPEN") {
      if (this.lastFailureTime && 
          Date.now() - this.lastFailureTime.getTime() > this.recoveryTimeout) {
        this.state = "HALF_OPEN";
        return true;
      }
      return false;
    }

    // HALF_OPEN - allow one request to test
    return true;
  }

  onSuccess(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  getState(): "CLOSED" | "OPEN" | "HALF_OPEN" {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = undefined;
  }
}

// Export singleton instance
export const apiManager = new ApiResilienceManager();
