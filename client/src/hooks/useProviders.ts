import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/clerk-react';
import { api, type Id } from '../types/convex';
import { useApiService, ApiProvider } from '../services/apiService';

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

  // Refresh data from Convex
  // With Single Convex Architecture, Convex subscriptions provide real-time updates
  // This function is kept for manual refresh if needed
  const refreshFromBackend = useCallback(async () => {
    if (!user?.id) return;

    // Convex subscriptions automatically update when data changes
    // This is a no-op but kept for API compatibility
    fetchProviders();
  }, [user?.id, fetchProviders]);

  // Create a new provider
  // Using Single Convex Architecture: Convex is the single source of truth
  // Server monitoring service will automatically pick up new providers from Convex
  const createProvider = useCallback(async (
    providerData: Omit<ApiProvider, '_id' | 'userId' | 'lastCheck'>
  ): Promise<string | null> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Create in Convex (single source of truth)
      // Server monitoring service reads from the same Convex database
      const convexId = await createProviderMutation({
        ...providerData,
        userId: user.id,
        lastCheck: new Date().toISOString(),
      });

      if (!convexId) {
        throw new Error('Failed to create provider: No ID returned');
      }

      return convexId;
    } catch (err) {
      console.error('Error creating provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to create provider');
      throw err;
    }
  }, [user?.id, createProviderMutation]);

  // Update a provider
  // Using Single Convex Architecture: Convex is the single source of truth
  const updateProvider = useCallback(async (
    id: string,
    updates: Partial<ApiProvider>
  ): Promise<boolean> => {
    try {
      // Update in Convex (single source of truth)
      await updateProviderMutation({
        id: id as Id<"apiProviders">,
        ...updates,
      });

      return true;
    } catch (err) {
      console.error('Error updating provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to update provider');
      return false;
    }
  }, [updateProviderMutation]);

  // Delete a provider
  // Using Single Convex Architecture: Convex is the single source of truth
  const deleteProvider = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Delete from Convex (single source of truth)
      await deleteProviderMutation({ id: id as Id<"apiProviders"> });

      return true;
    } catch (err) {
      console.error('Error deleting provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete provider');
      return false;
    }
  }, [deleteProviderMutation]);

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
