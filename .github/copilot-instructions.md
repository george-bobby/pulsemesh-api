# PulseMesh API - AI Coding Agent Instructions

## Architecture Overview

**Dual Environment Isolation**: PulseMesh uses completely isolated client and server environments, each with independent Convex database functions.

- **Client** (`client/`): React + Vite frontend on port 8080 with its own `convex/` functions
- **Server** (`server/`): Hono.js backend on port 3001 with separate `convex/` functions
- **Database**: Convex real-time database - each environment requires separate `convex.json` and deployment
- **Authentication**: Clerk JWT authentication integrated with both environments

Critical: Client and server are NOT a traditional API client-server relationship. Each talks to Convex independently.

## Core Domain: API Resilience & Monitoring

This system monitors external API providers with self-healing capabilities:

### Key Services Architecture (server/src/services/)

- **circuitBreakerService**: Implements CLOSED/OPEN/HALF_OPEN states with EventEmitter pattern
- **retryService**: Exponential backoff with configurable attempts
- **failoverService**: Priority-based provider failover with multiple strategies
- **selfHealingService**: Orchestrates all resilience patterns, extends EventEmitter for cross-service events
- **monitoringService**: Cron-based health checking using `node-cron`, manages circuit breakers per provider
- **anomalyDetectionService**: Statistical baseline detection for latency/error rate anomalies
- **convexService**: Single source of truth for database operations using `ConvexHttpClient`

### Data Model (Both client/convex/schema.ts and server/convex/schema.ts)

```typescript
apiProviders: {
  name, type, endpoint, isHealthy, latency, errorRate, priority,
  isPrimary, lastCheck, userId
}
healthChecks: { providerId, timestamp, isHealthy, latency, statusCode, errorMessage }
// Server-only:
circuitBreakerMetrics: { providerId, state, failureCount, successCount, ... }
retryMetrics, failoverEvents, anomalyDetections, selfHealingActions
```

## Development Workflow

### Environment Setup

Both client and server require separate environment configuration:

**Client**: `.env.local` with `VITE_CONVEX_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_BASE_URL`
**Server**: `.env` with `CONVEX_URL`, `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, `PORT`, monitoring config

**CRITICAL**: Each environment needs its own `npm run convex:dev` process running in parallel terminals.

### Running the Application (4 terminals required)

```bash
# Terminal 1 - Server
cd server && npm run dev  # Port 3004

# Terminal 2 - Client
cd client && npm run dev  # Port 8080

# Terminal 3 - Server Convex
cd server && npm run convex:dev

# Terminal 4 - Client Convex
cd client && npm run convex:dev
```

### Build Commands

- Client: `npm run build` (Vite) or `npm run build:dev` for dev mode
- Server: `npm run build` (TypeScript to `dist/`), `npm start` for production

## Code Patterns & Conventions

### Convex Integration Pattern

```typescript
// Client: React hooks with Convex queries
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const providers = useQuery(api.apiProviders.getByUser, { userId: user.id });
const createMutation = useMutation(api.apiProviders.create);

// Server: ConvexHttpClient for backend operations
import { ConvexHttpClient } from 'convex/browser';
const client = new ConvexHttpClient(env.CONVEX_URL);
await client.mutation(api.apiProviders.create, { ... });
```

### Authentication Flow

1. Clerk provides JWT tokens in both environments
2. Client: `ConvexProviderWithClerk` wraps app in `main.tsx`
3. Server: `authMiddleware` validates Clerk JWT, attaches user to context
4. Convex: `auth.config.ts` configures JWT issuer domain (identical in both environments)

### State Management

- **Client**: React Query (`@tanstack/react-query`) + Convex real-time subscriptions
- **Server**: Service classes as singletons (e.g., `export const monitoringService = new MonitoringService()`)

### UI Components

Uses shadcn/ui components from `client/src/components/ui/`. All components use:

- Tailwind CSS with custom config in `tailwind.config.ts`
- Class variance authority (`cva`) for variant management
- Radix UI primitives for accessibility

## Project-Specific Conventions

### Type Safety Boundaries

- Zod schemas in `server/src/types/index.ts` for runtime validation
- Convex generates types in `_generated/` - never edit manually
- Client defines separate interfaces in `services/apiService.ts`

### Event-Driven Architecture

Services emit events for cross-cutting concerns:

```typescript
selfHealingService.on('failoverSuccess', async (event) => { ... });
circuitBreakerService.on('stateChanged', async (event) => { ... });
```

### Error Handling Pattern

```typescript
// Server uses custom ApiError class
throw new ApiError('Message', 400);

// All routes return ApiResponse shape:
{ success: boolean, data?: any, error?: string, timestamp: number }
```

### File Organization

- Routes use Hono's chaining: `app.route('/providers', providerRoutes)`
- Pages match routes: `client/src/pages/Dashboard.tsx` → `/dashboard`
- Protected routes wrap with `<ProtectedRoute>` component

## Testing & Debugging

### Demo Scripts

Run `tsx server/scripts/demo-self-healing.ts` to simulate circuit breaker, retry, and failover scenarios with httpbin.org.

### Health Checks

- Server: `GET /health` and `GET /health/detailed` for system status
- Monitoring runs on cron schedule (default 30s, configurable via `MONITORING_INTERVAL`)

## Common Pitfalls

1. **Dual Convex Deployments**: Forgetting to run both `convex:dev` processes causes "function not found" errors
2. **Schema Changes**: Require `npx convex deploy` in correct environment after modifying `schema.ts`
3. **CORS**: Server allows `localhost:8080` and `localhost:3000` only in dev mode
4. **Circuit Breaker State**: Persisted in Convex `circuitBreakerMetrics` table, not in-memory
5. **UserId Mismatches**: Always use Clerk's `user.id` for filtering, not email or other fields
6. **Import Paths**: Use `.js` extensions in server TypeScript imports (e.g., `'./service.js'` not `'./service'`)

## Key Files for Reference

- Client routing: `client/src/App.tsx`
- Server entry: `server/src/index.ts`
- Resilience orchestration: `server/src/services/selfHealingService.ts`
- Schema definitions: `{client,server}/convex/schema.ts`
- Environment validation: `server/src/config/env.ts`
