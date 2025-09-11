import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { convexService } from '../services/convexService.js';
import { webSocketService } from '../services/websocketService.js';
import { authMiddleware, requireUser } from '../middleware/auth.js';
import { ApiProviderSchema, ApiResponse, ApiError } from '../types/index.js';

const providers = new Hono();

// Apply authentication middleware to all routes
providers.use('*', authMiddleware);

// Validation schemas
const createProviderSchema = ApiProviderSchema.omit({ _id: true, lastCheck: true });
const updateProviderSchema = ApiProviderSchema.partial().omit({ _id: true, userId: true });

// Get all providers for the authenticated user
providers.get('/', async (c) => {
  try {
    const user = requireUser(c);
    const userProviders = await convexService.getApiProvidersByUser(user.userId);
    
    const response: ApiResponse = {
      success: true,
      data: userProviders,
      timestamp: Date.now(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error getting providers:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to get providers',
      timestamp: Date.now(),
    };

    return c.json(response, error instanceof ApiError ? error.statusCode : 500);
  }
});

// Get a specific provider by ID
providers.get('/:id', async (c) => {
  try {
    const user = requireUser(c);
    const id = c.req.param('id');
    
    const provider = await convexService.getApiProvider(id);
    
    if (!provider) {
      const response: ApiResponse = {
        success: false,
        error: 'Provider not found',
        timestamp: Date.now(),
      };
      return c.json(response, 404);
    }

    // Check if user owns this provider
    if (provider.userId !== user.userId) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied',
        timestamp: Date.now(),
      };
      return c.json(response, 403);
    }

    const response: ApiResponse = {
      success: true,
      data: provider,
      timestamp: Date.now(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error getting provider:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to get provider',
      timestamp: Date.now(),
    };

    return c.json(response, error instanceof ApiError ? error.statusCode : 500);
  }
});

// Create a new provider
providers.post('/', zValidator('json', createProviderSchema), async (c) => {
  try {
    const user = requireUser(c);
    const providerData = c.req.valid('json');
    
    const newProvider = {
      ...providerData,
      userId: user.userId,
      lastCheck: new Date().toISOString(),
    };

    const providerId = await convexService.createApiProvider(newProvider);
    
    // Get the created provider
    const createdProvider = await convexService.getApiProvider(providerId);
    
    // Broadcast to WebSocket clients
    if (createdProvider) {
      webSocketService.broadcastProviderAdded(createdProvider);
    }

    const response: ApiResponse = {
      success: true,
      data: { id: providerId, ...createdProvider },
      timestamp: Date.now(),
    };

    return c.json(response, 201);
  } catch (error) {
    console.error('Error creating provider:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to create provider',
      timestamp: Date.now(),
    };

    return c.json(response, error instanceof ApiError ? error.statusCode : 500);
  }
});

// Update a provider
providers.put('/:id', zValidator('json', updateProviderSchema), async (c) => {
  try {
    const user = requireUser(c);
    const id = c.req.param('id');
    const updates = c.req.valid('json');
    
    // Check if provider exists and user owns it
    const existingProvider = await convexService.getApiProvider(id);
    
    if (!existingProvider) {
      const response: ApiResponse = {
        success: false,
        error: 'Provider not found',
        timestamp: Date.now(),
      };
      return c.json(response, 404);
    }

    if (existingProvider.userId !== user.userId) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied',
        timestamp: Date.now(),
      };
      return c.json(response, 403);
    }

    await convexService.updateApiProvider(id, updates);
    
    // Get updated provider
    const updatedProvider = await convexService.getApiProvider(id);
    
    // Broadcast to WebSocket clients
    if (updatedProvider) {
      webSocketService.broadcastProviderUpdated(updatedProvider);
    }

    const response: ApiResponse = {
      success: true,
      data: updatedProvider,
      timestamp: Date.now(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error updating provider:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to update provider',
      timestamp: Date.now(),
    };

    return c.json(response, error instanceof ApiError ? error.statusCode : 500);
  }
});

// Delete a provider
providers.delete('/:id', async (c) => {
  try {
    const user = requireUser(c);
    const id = c.req.param('id');
    
    // Check if provider exists and user owns it
    const existingProvider = await convexService.getApiProvider(id);
    
    if (!existingProvider) {
      const response: ApiResponse = {
        success: false,
        error: 'Provider not found',
        timestamp: Date.now(),
      };
      return c.json(response, 404);
    }

    if (existingProvider.userId !== user.userId) {
      const response: ApiResponse = {
        success: false,
        error: 'Access denied',
        timestamp: Date.now(),
      };
      return c.json(response, 403);
    }

    await convexService.deleteApiProvider(id);
    
    // Broadcast to WebSocket clients
    webSocketService.broadcastProviderRemoved(id);

    const response: ApiResponse = {
      success: true,
      data: { message: 'Provider deleted successfully' },
      timestamp: Date.now(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error deleting provider:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to delete provider',
      timestamp: Date.now(),
    };

    return c.json(response, error instanceof ApiError ? error.statusCode : 500);
  }
});

export default providers;
