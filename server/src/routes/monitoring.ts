import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { stream } from 'hono/streaming';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { convexService } from '../services/convexService.js';
import { monitoringService } from '../services/monitoringService.js';
import { authMiddleware, requireUser } from '../middleware/auth.js';
import { ApiResponse, ApiError } from '../types/index.js';

const monitoring = new Hono();

// Helper function to get proper status codes
const getStatusCode = (error: unknown): ContentfulStatusCode => {
	if (error instanceof ApiError) {
		return error.statusCode as ContentfulStatusCode;
	}
	return 500;
};

// Apply authentication middleware to all routes except stream (which handles auth manually)
monitoring.use('*', async (c, next) => {
	// Skip auth middleware for stream endpoint as it handles auth via query params
	if (c.req.path.includes('/stream/')) {
		await next();
	} else {
		await authMiddleware(c, next);
	}
});

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

		const history = await convexService.getHealthCheckHistory(
			providerId,
			limit
		);

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
			error:
				error instanceof ApiError
					? error.message
					: 'Failed to get health check history',
			timestamp: Date.now(),
		};

		return c.json(response, getStatusCode(error));
	}
});

// Get health statistics for a provider
monitoring.get('/providers/:id/stats', async (c) => {
	try {
		const user = requireUser(c);
		const providerId = c.req.param('id');
		const since = c.req.query('since')
			? parseInt(c.req.query('since')!)
			: undefined;

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
			error:
				error instanceof ApiError
					? error.message
					: 'Failed to get provider stats',
			timestamp: Date.now(),
		};

		return c.json(response, getStatusCode(error));
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
			error:
				error instanceof ApiError
					? error.message
					: 'Failed to trigger health check',
			timestamp: Date.now(),
		};

		return c.json(response, getStatusCode(error));
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

		const circuitBreakerStatus =
			monitoringService.getCircuitBreakerStatus(providerId);

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
			error:
				error instanceof ApiError
					? error.message
					: 'Failed to get circuit breaker status',
			timestamp: Date.now(),
		};

		return c.json(response, getStatusCode(error));
	}
});

// Get monitoring service status
monitoring.get('/status', async (c) => {
	try {
		const isRunning = monitoringService.getIsRunning();

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

// Real-time monitoring stream (Server-Sent Events)
monitoring.get('/stream/:userId', async (c) => {
	try {
		// Try to get user from auth middleware first, then fallback to query param
		let user: any;
		let jwtToken: string | null = null;

		try {
			user = requireUser(c);
		} catch (authError) {
			// If auth middleware failed, try to get token from query params
			const token = c.req.query('token');
			if (!token) {
				const response: ApiResponse = {
					success: false,
					error: 'Authentication required - missing token',
					timestamp: Date.now(),
				};
				return c.json(response, 401);
			}

			jwtToken = token; // Store the JWT token for Convex authentication

			// Verify the token manually
			const { verifyToken } = await import('@clerk/backend');
			const { env } = await import('../config/env.js');

			try {
				const payload = await verifyToken(token, {
					secretKey: env.CLERK_SECRET_KEY,
					issuer: env.CLERK_JWT_ISSUER_DOMAIN,
				});

				if (!payload || !payload.sub) {
					const response: ApiResponse = {
						success: false,
						error: 'Invalid token',
						timestamp: Date.now(),
					};
					return c.json(response, 401);
				}

				user = {
					userId: payload.sub,
					email: (payload.email as string) || '',
					name:
						(payload.name as string) || (payload.given_name as string) || '',
				};
			} catch (tokenError) {
				const response: ApiResponse = {
					success: false,
					error: 'Token verification failed',
					timestamp: Date.now(),
				};
				return c.json(response, 401);
			}
		}

		const targetUserId = c.req.param('userId');

		// Only allow users to stream their own data
		if (user.userId !== targetUserId) {
			const response: ApiResponse = {
				success: false,
				error: 'Access denied',
				timestamp: Date.now(),
			};
			return c.json(response, 403);
		}

		return stream(c, async (stream) => {
			// Set SSE headers
			c.header('Content-Type', 'text/event-stream');
			c.header('Cache-Control', 'no-cache');
			c.header('Connection', 'keep-alive');
			c.header('Access-Control-Allow-Origin', '*');

			// Send initial connection message
			await stream.write(
				'data: {"type":"connected","timestamp":' + Date.now() + '}\n\n'
			);

			// Set up interval to send updates every 30 seconds
			const interval = setInterval(async () => {
				try {
					// Get user's providers (pass JWT token for authentication)
					const providers = await convexService.getApiProvidersByUser(
						user.userId,
						jwtToken || undefined
					);

					// Get recent health checks for all providers
					const recentChecks = await convexService.getRecentHealthChecks(10);

					// Send update
					const update = {
						type: 'health_update',
						timestamp: Date.now(),
						providers: providers.length,
						recentChecks: recentChecks.slice(0, 5), // Limit to prevent large payloads
					};

					await stream.write(`data: ${JSON.stringify(update)}\n\n`);
				} catch (error) {
					console.error('Error sending stream update:', error);
					await stream.write(
						`data: {"type":"error","message":"Stream error","timestamp":${Date.now()}}\n\n`
					);
				}
			}, 30000);

			// Cleanup on disconnect
			c.req.raw.signal.addEventListener('abort', () => {
				clearInterval(interval);
				console.log('Monitoring stream disconnected for user:', user.userId);
			});

			// Keep connection alive
			const keepAlive = setInterval(async () => {
				await stream.write(': keepalive\n\n');
			}, 15000);

			c.req.raw.signal.addEventListener('abort', () => {
				clearInterval(keepAlive);
			});
		});
	} catch (error) {
		console.error('Error setting up monitoring stream:', error);
		const response: ApiResponse = {
			success: false,
			error: 'Failed to set up monitoring stream',
			timestamp: Date.now(),
		};
		return c.json(response, 500);
	}
});

// Self-healing endpoints

// Trigger self-healing for a specific provider
monitoring.post('/providers/:id/self-heal', async (c) => {
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

		// Trigger self-healing
		const result = await monitoringService.triggerSelfHealing(providerId);

		const response: ApiResponse = {
			success: true,
			data: result,
			timestamp: Date.now(),
		};

		return c.json(response);
	} catch (error) {
		console.error('Error triggering self-healing:', error);

		const response: ApiResponse = {
			success: false,
			error:
				error instanceof ApiError
					? error.message
					: 'Failed to trigger self-healing',
			timestamp: Date.now(),
		};

		return c.json(response, getStatusCode(error));
	}
});

// Get self-healing status and statistics
monitoring.get('/self-healing/status', async (c) => {
	try {
		const user = requireUser(c);

		const status = await monitoringService.getSelfHealingStatus();

		const response: ApiResponse = {
			success: true,
			data: status,
			timestamp: Date.now(),
		};

		return c.json(response);
	} catch (error) {
		console.error('Error getting self-healing status:', error);

		const response: ApiResponse = {
			success: false,
			error:
				error instanceof ApiError
					? error.message
					: 'Failed to get self-healing status',
			timestamp: Date.now(),
		};

		return c.json(response, getStatusCode(error));
	}
});

export default monitoring;
