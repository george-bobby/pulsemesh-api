# PulseMesh API

A comprehensive API monitoring system with isolated client and server environments. The client is a modern React frontend, and the server is a robust Hono.js backend, both sharing the same Convex database for real-time synchronization.

## 🏗️ Architecture Overview

```
pulsemesh-api/
├── client/                 # React Frontend (Port 8080)
│   ├── src/               # React components and pages
│   │   ├── components/   # UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/     # API services
│   │   └── types/         # TypeScript definitions
│   └── package.json       # Client dependencies
│
├── server/                # Hono.js Backend (Port 3004)
│   ├── src/               # Server routes and services
│   │   ├── config/        # Configuration
│   │   ├── middleware/    # Custom middleware
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Business logic
│   │   └── types/         # TypeScript definitions
│   ├── convex/            # Convex database functions (shared)
│   └── package.json       # Server dependencies
│
└── README.md
```

### Single Convex Architecture

Both client and server share the same Convex database deployment, ensuring data consistency and enabling real-time updates via Convex subscriptions.

```
┌─────────────────┐         ┌─────────────────┐
│   React Client  │────────▶│   Convex DB     │
│   (Port 8080)   │◀────────│  (Shared)       │
└─────────────────┘         └─────────────────┘
         │                           ▲
         │ REST API                  │
         │ (Auth Required)           │
         ▼                           │
┌─────────────────┐                  │
│  Hono Server    │──────────────────┘
│  (Port 3004)    │
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account and deployment
- Clerk account and application

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd pulsemesh-api
   ```

2. **Install dependencies:**

   ```bash
   # Client
   cd client && npm install && cd ..

   # Server
   cd server && npm install && cd ..
   ```

3. **Configure environment variables:**

   **Client** - Create `client/.env.local`:

   ```bash
   cd client
   # Create .env.local file with the following variables:
   ```

   ```env
   VITE_CONVEX_URL=https://your-deployment.convex.cloud
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key
   VITE_API_BASE_URL=http://localhost:3004
   VITE_WS_URL=ws://localhost:3003/ws
   ```

   **Server** - Create `server/.env`:

   ```bash
   cd server
   # Create .env file with the following variables:
   ```

   ```env
   CONVEX_DEPLOYMENT=your-deployment-name
   CONVEX_URL=https://your-deployment.convex.cloud
   CLERK_SECRET_KEY=sk_test_your-secret-key
   CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
   PORT=3004
   NODE_ENV=development
   MONITORING_INTERVAL=30000
   MONITORING_TIMEOUT=10000
   MAX_CONCURRENT_CHECKS=10
   ```

   **Important**: Both must use the **same** `CONVEX_URL`:

   - Client: `VITE_CONVEX_URL=https://your-deployment.convex.cloud`
   - Server: `CONVEX_URL=https://your-deployment.convex.cloud`

4. **Start all services:**

   **Terminal 1 - Server:**

   ```bash
   cd server
   npm run dev
   ```

   Server starts on `http://localhost:3004`

   **Terminal 2 - Client:**

   ```bash
   cd client
   npm run dev
   ```

   Client starts on `http://localhost:8080`

   **Terminal 3 - Convex (Shared):**

   ```bash
   cd server
   npm run convex:dev
   ```

   **Note**: Only the server has Convex functions. The client connects to the same Convex deployment via `VITE_CONVEX_URL`. Only one Convex dev process is needed.

## 📊 System Components

### Client (React Frontend)

- **Port**: 8080
- **Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Features**: Real-time dashboard, API provider management, analytics, authentication
- **Database**: Convex (shared with server)

### Server (Hono.js Backend)

- **Port**: 3004 (HTTP) + 3003 (WebSocket)
- **Tech Stack**: Hono.js, TypeScript, Convex, Clerk
- **Features**: RESTful API, WebSocket server, automated health checks, circuit breaker patterns

## 🌐 API Endpoints

### Health Check

- `GET /health` - Server health status
- `GET /health/detailed` - Detailed health with service status

### Providers (Require Auth)

- `GET /api/providers` - Get all providers for authenticated user
- `POST /api/providers` - Create new API provider
- `GET /api/providers/:id` - Get specific provider
- `PUT /api/providers/:id` - Update provider
- `DELETE /api/providers/:id` - Delete provider

### Monitoring (Require Auth)

- `GET /api/monitoring/providers/:id/history` - Get health check history
- `GET /api/monitoring/providers/:id/stats` - Get provider statistics
- `POST /api/monitoring/providers/:id/check` - Trigger manual health check
- `GET /api/monitoring/providers/:id/circuit-breaker` - Get circuit breaker status

### WebSocket

- `ws://localhost:3003/ws` - Real-time status updates

## 🔐 Authentication

The application uses Clerk for authentication:

1. User signs in via Clerk in the React client
2. Client receives JWT token from Clerk
3. Client sends JWT token in `Authorization: Bearer <token>` header for API requests
4. Server validates JWT token with Clerk
5. Authenticated requests access Convex database

**Setup:**

1. Create a Clerk application at [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Configure JWT template named "convex" in Clerk Dashboard
3. Add Clerk keys to environment variables:
   - Client: `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_JWT_ISSUER_DOMAIN`
   - Server: `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`

## 🔄 Real-Time Updates

PulseMesh uses **Convex subscriptions** for automatic real-time updates:

1. Server writes health check results to Convex
2. Convex automatically notifies all subscribed clients
3. Client React components re-render with new data via `useQuery` hooks

**Benefits:**

- ✅ Automatic real-time updates (no manual polling)
- ✅ Efficient (only updates when data changes)
- ✅ Built-in caching and optimization

**Verification:**

- Create a provider → UI updates without refresh
- Health check completes → Provider status updates automatically
- No polling requests visible in browser network tab

## 🧪 Testing

### Quick Test

1. Start all services (see Quick Start)
2. Open `http://localhost:8080` and sign in
3. Add a provider:
   - Name: `HTTPBin Test`
   - Type: `Monitoring`
   - Endpoint: `https://httpbin.org/status/200`
4. Verify provider appears immediately
5. Wait 30 seconds for automatic health check
6. Verify status updates automatically (no refresh needed)

### API Testing

Get JWT token from browser DevTools → Application → Local Storage → Clerk session:

```bash
# Create provider
curl -X POST http://localhost:3004/api/providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test API",
    "type": "monitoring",
    "endpoint": "https://httpbin.org/status/200",
    "isHealthy": true,
    "latency": 0,
    "errorRate": 0,
    "priority": 1
  }'

# Trigger health check
curl -X POST http://localhost:3004/api/monitoring/providers/PROVIDER_ID/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Checklist

**Setup:**

- [ ] Convex account created and deployment active
- [ ] Clerk account created and application configured
- [ ] Environment variables configured in both client and server
- [ ] Both use same `CONVEX_URL`

**Functionality:**

- [ ] User can sign in with Clerk
- [ ] User can create/update/delete providers
- [ ] Providers appear in UI immediately (real-time)
- [ ] Health checks run automatically (every 30 seconds)
- [ ] Provider status updates automatically
- [ ] API endpoints require authentication
- [ ] Users can only access their own providers

**Troubleshooting:**

- Verify `CONVEX_URL` is correct and deployment is active
- Verify Clerk keys are correct
- Check ports 3004 and 8080 are available
- Check server logs for errors
- Check browser console for client-side errors

### Database Schema

The Convex schema (defined in `server/convex/schema.ts`) includes:

- `apiProviders` - API provider configurations
- `healthChecks` - Health check history
- `userProfiles` - User account data
- `messages` - System messages
- `circuitBreakerMetrics` - Circuit breaker state tracking
- `retryMetrics` - Retry attempt tracking
- `failoverEvents` - Failover event history
- `selfHealingActions` - Self-healing action log
- `anomalyDetection` - Anomaly detection records

### Adding Features

**Client-side:**

1. Work in `client/` directory
2. Add React components, pages, hooks
3. Client connects to Convex via `VITE_CONVEX_URL` (no local Convex functions)
4. Test with `npm run dev`

**Server-side:**

1. Work in `server/` directory
2. Add routes, services, middleware
3. Update server Convex functions if needed
4. Test with `npm run dev`

**Schema Updates:**

1. Update `server/convex/schema.ts` (schema is shared via server's Convex deployment)
2. Deploy with `npm run convex:deploy` from server directory

## 📚 Additional Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Documentation](https://docs.clerk.dev/)
- [Hono.js Documentation](https://hono.dev/)
- [React Documentation](https://react.dev/)
