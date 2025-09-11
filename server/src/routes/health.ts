import { Hono } from 'hono';
import { convexService } from '../services/convexService.js';
import { monitoringService } from '../services/monitoringService.js';
import { webSocketService } from '../services/websocketService.js';
import { ApiResponse } from '../types/index.js';

const health = new Hono();

// Basic health check endpoint
health.get('/', async (c) => {
  try {
    const timestamp = Date.now();
    
    // Check database connectivity
    const dbHealthy = await convexService.ping();
    
    // Check monitoring service status
    const monitoringHealthy = monitoringService.isRunning();
    
    // Check WebSocket service status
    const wsStats = webSocketService.getStats();
    
    const response: ApiResponse = {
      success: true,
      data: {
        status: 'healthy',
        timestamp,
        services: {
          database: dbHealthy ? 'healthy' : 'unhealthy',
          monitoring: monitoringHealthy ? 'healthy' : 'unhealthy',
          websocket: wsStats.isRunning ? 'healthy' : 'unhealthy',
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0',
      },
      timestamp,
    };

    return c.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Health check failed',
      timestamp: Date.now(),
    };

    return c.json(response, 500);
  }
});

// Detailed health check with service status
health.get('/detailed', async (c) => {
  try {
    const timestamp = Date.now();
    
    // Check database connectivity
    const dbHealthy = await convexService.ping();
    
    // Check monitoring service status
    const monitoringHealthy = monitoringService.isRunning();
    
    // Check WebSocket service status
    const wsStats = webSocketService.getStats();
    
    // Get system information
    const systemInfo = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };

    const response: ApiResponse = {
      success: true,
      data: {
        status: 'healthy',
        timestamp,
        services: {
          database: {
            status: dbHealthy ? 'healthy' : 'unhealthy',
            lastCheck: timestamp,
          },
          monitoring: {
            status: monitoringHealthy ? 'healthy' : 'unhealthy',
            isRunning: monitoringHealthy,
          },
          websocket: {
            status: wsStats.isRunning ? 'healthy' : 'unhealthy',
            connectedClients: wsStats.connectedClients,
            isRunning: wsStats.isRunning,
          },
        },
        system: systemInfo,
        version: process.env.npm_package_version || '1.0.0',
      },
      timestamp,
    };

    return c.json(response);
  } catch (error) {
    console.error('Detailed health check error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Detailed health check failed',
      timestamp: Date.now(),
    };

    return c.json(response, 500);
  }
});

// Readiness probe (for Kubernetes/Docker)
health.get('/ready', async (c) => {
  try {
    const dbHealthy = await convexService.ping();
    const monitoringHealthy = monitoringService.isRunning();
    
    if (dbHealthy && monitoringHealthy) {
      return c.json({ status: 'ready' });
    } else {
      return c.json({ status: 'not ready' }, 503);
    }
  } catch (error) {
    return c.json({ status: 'not ready', error: error.message }, 503);
  }
});

// Liveness probe (for Kubernetes/Docker)
health.get('/live', async (c) => {
  return c.json({ status: 'alive' });
});

export default health;
