import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { convexService } from '../services/convexService.js';
import { monitoringService } from '../services/monitoringService.js';
import { authMiddleware, requireUser } from '../middleware/auth.js';
import { ApiResponse, ApiError } from '../types/index.js';

const monitoring = new Hono();

// Apply authentication middleware to all routes
monitoring.use('*', authMiddleware);

// Get health check history for a provider
monitoring.get('/providers/:id/history', async (c) => {
  try {
    const user = requireUser(c);
    const providerId = c.req.param('id');
    const limit = parseInt(c.req.query('limit') || '100');
    
    // Check if user owns this provider
    const provider = await convexService.getApiProvider(providerId);
    if (!provider) {
      const response: ApiResponse = {
        success: false,
        error: 'Provider not found',
        timestamp: Date.now(),
      };
      return c.json(response, 404);
    }

    if (provider.userId !== user.userId) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied',
        timestamp: Date.now(),
      };
      return c.json(response, 403);
    }

    const history = await convexService.getHealthCheckHistory(providerId, limit);
    
    const response: ApiResponse = {
      success: true,
      data: history,
      timestamp: Date.now(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error getting health check history:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to get health check history',
      timestamp: Date.now(),
    };

    return c.json(response, error instanceof ApiError ? error.statusCode : 500);
  }
});

// Get health statistics for a provider
monitoring.get('/providers/:id/stats', async (c) => {
  try {
    const user = requireUser(c);
    const providerId = c.req.param('id');
    const since = c.req.query('since') ? parseInt(c.req.query('since')!) : undefined;
    
    // Check if user owns this provider
    const provider = await convexService.getApiProvider(providerId);
    if (!provider) {
      const response: ApiResponse = {
        success: false,
        error: 'Provider not found',
        timestamp: Date.now(),
      };
      return c.json(response, 404);
    }

    if (provider.userId !== user.userId) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied',
        timestamp: Date.now(),
      };
      return c.json(response, 403);
    }

    // This would need to be implemented in Convex
    // For now, return basic stats from the provider
    const stats = {
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      averageLatency: provider.latency,
      uptime: provider.isHealthy ? 100 : 0,
      lastCheck: provider.lastCheck,
    };
    
    const response: ApiResponse = {
      success: true,
      data: stats,
      timestamp: Date.now(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error getting provider stats:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to get provider stats',
      timestamp: Date.now(),
    };

    return c.json(response, error instanceof ApiError ? error.statusCode : 500);
  }
});

// Manually trigger a health check for a provider
monitoring.post('/providers/:id/check', async (c) => {
  try {
    const user = requireUser(c);
    const providerId = c.req.param('id');
    
    // Check if user owns this provider
    const provider = await convexService.getApiProvider(providerId);
    if (!provider) {
      const response: ApiResponse = {
        success: false,
        error: 'Provider not found',
        timestamp: Date.now(),
      };
      return c.json(response, 404);
    }

    if (provider.userId !== user.userId) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied',
        timestamp: Date.now(),
      };
      return c.json(response, 403);
    }

    // Trigger manual health check
    const result = await monitoringService.checkProvider(providerId);
    
    // Store the result
    await convexService.createHealthCheckResult(result);
    
    // Update provider health
    await convexService.updateProviderHealth(providerId, {
      isHealthy: result.isHealthy,
      latency: result.latency,
      lastCheck: new Date().toISOString(),
    });

    const response: ApiResponse = {
      success: true,
      data: result,
      timestamp: Date.now(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error triggering health check:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to trigger health check',
      timestamp: Date.now(),
    };

    return c.json(response, error instanceof ApiError ? error.statusCode : 500);
  }
});

// Get circuit breaker status for a provider
monitoring.get('/providers/:id/circuit-breaker', async (c) => {
  try {
    const user = requireUser(c);
    const providerId = c.req.param('id');
    
    // Check if user owns this provider
    const provider = await convexService.getApiProvider(providerId);
    if (!provider) {
      const response: ApiResponse = {
        success: false,
        error: 'Provider not found',
        timestamp: Date.now(),
      };
      return c.json(response, 404);
    }

    if (provider.userId !== user.userId) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied',
        timestamp: Date.now(),
      };
      return c.json(response, 403);
    }

    const circuitBreakerStatus = monitoringService.getCircuitBreakerStatus(providerId);
    
    const response: ApiResponse = {
      success: true,
      data: circuitBreakerStatus,
      timestamp: Date.now(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error getting circuit breaker status:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to get circuit breaker status',
      timestamp: Date.now(),
    };

    return c.json(response, error instanceof ApiError ? error.statusCode : 500);
  }
});

// Get monitoring service status
monitoring.get('/status', async (c) => {
  try {
    const isRunning = monitoringService.isRunning();
    
    const response: ApiResponse = {
      success: true,
      data: {
        isRunning,
        status: isRunning ? 'active' : 'inactive',
      },
      timestamp: Date.now(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error getting monitoring status:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to get monitoring status',
      timestamp: Date.now(),
    };

    return c.json(response, 500);
  }
});

export default monitoring;
