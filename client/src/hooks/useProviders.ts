import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { useApiService, ApiProvider } from '../services/apiService';
import { Id } from '../../convex/_generated/dataModel';

export interface ProviderWithMetrics extends ApiProvider {
  uptime?: number;
  avgResponseTime?: number;
  totalRequests?: number;
  successRate?: number;
}

export const useProviders = () => {
  const { user } = useUser();
  const apiService = useApiService();
  const [providers, setProviders] = useState<ProviderWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convex queries and mutations
  const convexProviders = useQuery(
    api.apiProviders.getByUser,
    user?.id ? { userId: user.id } : "skip"
  );
  
  const createProviderMutation = useMutation(api.apiProviders.create);
  const updateProviderMutation = useMutation(api.apiProviders.update);
  const deleteProviderMutation = useMutation(api.apiProviders.deleteProvider);

  // Fetch providers from Convex (primary source)
  const fetchProviders = useCallback(async () => {
    if (!user?.id || !convexProviders) return;

    try {
      setLoading(true);
      setError(null);

      // Use Convex data as primary source
      const providersWithMetrics: ProviderWithMetrics[] = convexProviders.map(provider => ({
        _id: provider._id,
        name: provider.name,
        type: provider.type,
        endpoint: provider.endpoint,
        isHealthy: provider.isHealthy,
        latency: provider.latency,
        errorRate: provider.errorRate,
        priority: provider.priority,
        isPrimary: provider.isPrimary,
        lastCheck: provider.lastCheck,
        userId: provider.userId,
        // Calculate derived metrics
        uptime: Math.max(85, 100 - provider.errorRate),
        avgResponseTime: provider.latency,
        successRate: Math.max(0, 100 - provider.errorRate),
      }));

      setProviders(providersWithMetrics);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  }, [user?.id, convexProviders]);

  // Refresh data from backend (for latest health status)
  const refreshFromBackend = useCallback(async () => {
    if (!user?.id) return;

    try {
      // This will trigger the backend to sync any new health check data
      await apiService.checkServerHealth();
    } catch (err) {
      console.warn('Backend refresh failed:', err);
    }
  }, [user?.id, apiService]);

  // Create a new provider
  const createProvider = useCallback(async (
    providerData: Omit<ApiProvider, '_id' | 'userId' | 'lastCheck'>
  ): Promise<string | null> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Create in Convex first (primary database)
      const convexId = await createProviderMutation({
        ...providerData,
        userId: user.id,
        lastCheck: new Date().toISOString(),
      });

      // Notify backend about new provider (backend will pick it up from Convex)
      try {
        await apiService.createProvider(providerData);
      } catch (backendError) {
        console.warn('Backend notification failed, but provider created in Convex:', backendError);
      }

      return convexId;
    } catch (err) {
      console.error('Error creating provider:', err);
      throw err;
    }
  }, [user?.id, createProviderMutation, apiService]);

  // Update a provider
  const updateProvider = useCallback(async (
    id: string,
    updates: Partial<ApiProvider>
  ): Promise<boolean> => {
    try {
      // Update in Convex first
      await updateProviderMutation({
        id: id as Id<"apiProviders">,
        ...updates,
      });

      // Notify backend
      try {
        await apiService.updateProvider(id, updates);
      } catch (backendError) {
        console.warn('Backend update failed, but provider updated in Convex:', backendError);
      }

      return true;
    } catch (err) {
      console.error('Error updating provider:', err);
      return false;
    }
  }, [updateProviderMutation, apiService]);

  // Delete a provider
  const deleteProvider = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Delete from Convex first
      await deleteProviderMutation({ id: id as Id<"apiProviders"> });

      // Notify backend
      try {
        await apiService.deleteProvider(id);
      } catch (backendError) {
        console.warn('Backend deletion failed, but provider deleted from Convex:', backendError);
      }

      return true;
    } catch (err) {
      console.error('Error deleting provider:', err);
      return false;
    }
  }, [deleteProviderMutation, apiService]);

  // Get health history for a provider
  const getHealthHistory = useCallback(async (providerId: string) => {
    try {
      return await apiService.getProviderHealthHistory(providerId);
    } catch (err) {
      console.error('Error fetching health history:', err);
      return [];
    }
  }, [apiService]);

  // Auto-refresh data periodically
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchProviders();

    // Set up periodic refresh from backend (every 30 seconds)
    const interval = setInterval(() => {
      refreshFromBackend();
      fetchProviders();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, fetchProviders, refreshFromBackend]);

  // Fetch when convex data changes
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return {
    providers,
    loading,
    error,
    createProvider,
    updateProvider,
    deleteProvider,
    getHealthHistory,
    refreshFromBackend,
    refetch: fetchProviders,
  };
};
