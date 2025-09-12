import { useAuth } from "@clerk/clerk-react";

// Types for API communication
export interface ApiProvider {
  _id?: string;
  name: string;
  type: string;
  endpoint: string;
  isHealthy: boolean;
  latency: number;
  errorRate: number;
  priority: number;
  isPrimary?: boolean;
  lastCheck: string;
  userId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface HealthCheckResult {
  providerId: string;
  timestamp: number;
  isHealthy: boolean;
  latency: number;
  responseTime: number;
  statusCode?: number;
  errorMessage?: string;
}

class ApiService {
  private baseUrl: string;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004';
  }

  // Set the auth token getter function
  setAuthTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data: ApiResponse<T> = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Provider management methods
  async getProviders(): Promise<ApiProvider[]> {
    const response = await this.request<ApiProvider[]>('/api/providers');
    return response.data || [];
  }

  async getProvider(id: string): Promise<ApiProvider | null> {
    try {
      const response = await this.request<ApiProvider>(`/api/providers/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get provider:', error);
      return null;
    }
  }

  async createProvider(provider: Omit<ApiProvider, '_id' | 'userId' | 'lastCheck'>): Promise<string | null> {
    try {
      const response = await this.request<{ id: string }>('/api/providers', {
        method: 'POST',
        body: JSON.stringify(provider),
      });
      return response.data?.id || null;
    } catch (error) {
      console.error('Failed to create provider:', error);
      throw error;
    }
  }

  async updateProvider(id: string, updates: Partial<ApiProvider>): Promise<boolean> {
    try {
      await this.request(`/api/providers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return true;
    } catch (error) {
      console.error('Failed to update provider:', error);
      return false;
    }
  }

  async deleteProvider(id: string): Promise<boolean> {
    try {
      await this.request(`/api/providers/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Failed to delete provider:', error);
      return false;
    }
  }

  // Health check methods
  async getProviderHealthHistory(providerId: string, limit = 50): Promise<HealthCheckResult[]> {
    try {
      const response = await this.request<HealthCheckResult[]>(
        `/api/monitoring/providers/${providerId}/history?limit=${limit}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to get health history:', error);
      return [];
    }
  }

  // Health check endpoint
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Hook to use API service with authentication
export const useApiService = () => {
  const { getToken } = useAuth();

  // Set up auth token getter when hook is used
  if (getToken && !apiService['getToken']) {
    apiService.setAuthTokenGetter(getToken);
  }

  return apiService;
};
