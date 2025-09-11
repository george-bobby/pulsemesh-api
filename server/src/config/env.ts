import { config } from 'dotenv';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, '../../.env.local') });

// Environment validation schema
const envSchema = z.object({
	// Server Configuration
	PORT: z.string().default('3001').transform(Number),
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),

	// Convex Database Configuration
	CONVEX_DEPLOYMENT: z.string().min(1, 'CONVEX_DEPLOYMENT is required'),
	CONVEX_URL: z.string().url('CONVEX_URL must be a valid URL'),

	// Clerk Authentication Configuration
	CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
	CLERK_JWT_ISSUER_DOMAIN: z
		.string()
		.url('CLERK_JWT_ISSUER_DOMAIN must be a valid URL'),

	// Monitoring Configuration
	MONITORING_INTERVAL: z.string().default('30000').transform(Number),
	MONITORING_TIMEOUT: z.string().default('10000').transform(Number),
	MAX_CONCURRENT_CHECKS: z.string().default('10').transform(Number),

	// API Endpoints to Monitor
	API_ENDPOINTS_TO_MONITOR: z
		.string()
		.default('[]')
		.transform((str) => {
			try {
				return JSON.parse(str);
			} catch {
				return [];
			}
		}),

	// WebSocket Configuration
	WS_PORT: z.string().default('3002').transform(Number),
	WS_HEARTBEAT_INTERVAL: z.string().default('30000').transform(Number),

	// Logging Configuration
	LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
	LOG_FORMAT: z.enum(['json', 'text']).default('json'),

	// Health Check Configuration
	HEALTH_CHECK_ENABLED: z
		.string()
		.default('true')
		.transform((str) => str === 'true'),
	HEALTH_CHECK_INTERVAL: z.string().default('60000').transform(Number),

	// Circuit Breaker Configuration
	CIRCUIT_BREAKER_FAILURE_THRESHOLD: z.string().default('5').transform(Number),
	CIRCUIT_BREAKER_TIMEOUT: z.string().default('60000').transform(Number),
	CIRCUIT_BREAKER_RESET_TIMEOUT: z.string().default('300000').transform(Number),
});

// Validate and export environment variables
export const env = envSchema.parse(process.env);

// Type for environment variables
export type Environment = z.infer<typeof envSchema>;

// Helper function to check if we're in development
export const isDevelopment = () => env.NODE_ENV === 'development';

// Helper function to check if we're in production
export const isProduction = () => env.NODE_ENV === 'production';

// Helper function to check if we're in test
export const isTest = () => env.NODE_ENV === 'test';
