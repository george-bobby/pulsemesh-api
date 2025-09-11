# PulseMesh API Server

A comprehensive Hono.js backend for the PulseMesh API monitoring system with real-time health checking, circuit breaker patterns, and WebSocket communication.

## 🚀 Features

- **API Monitoring**: Automated health checking of API endpoints
- **Real-time Updates**: WebSocket server for live status updates
- **Circuit Breaker**: Built-in resilience patterns for robust monitoring
- **Authentication**: Clerk JWT authentication integration
- **RESTful API**: Complete CRUD operations for API providers
- **Health Checks**: Comprehensive system monitoring
- **Background Jobs**: Scheduled monitoring with node-cron
- **Type Safety**: Full TypeScript implementation
- **Isolated Environment**: Runs independently from client

## 🛠️ Tech Stack

- **Hono.js** - Fast, lightweight web framework
- **TypeScript** - Type-safe JavaScript
- **Convex** - Real-time database integration
- **Clerk** - JWT authentication
- **WebSocket** - Real-time communication
- **Node-cron** - Scheduled monitoring tasks
- **Axios** - HTTP client for health checks
- **Zod** - Runtime type validation

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Convex account and deployment
- Clerk account and application

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment template and configure your settings:

```bash
cp .env.example .env.local
```

Configure the following environment variables in `.env.local`:

```env
# Convex Database Configuration
CONVEX_DEPLOYMENT=your-deployment-name
CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Authentication Configuration
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
CLERK_SECRET_KEY=sk_test_your-secret-key

# Server Configuration
PORT=3004
NODE_ENV=development

# WebSocket Configuration
WS_PORT=3003
WS_HEARTBEAT_INTERVAL=30000

# Monitoring Configuration
MONITORING_INTERVAL=30000
MONITORING_TIMEOUT=10000
MAX_CONCURRENT_CHECKS=10

# Circuit Breaker Configuration
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000
CIRCUIT_BREAKER_RESET_TIMEOUT=300000
```

### 3. Set Up Convex Database

Initialize and deploy your Convex functions:

```bash
npm run convex:dev
```

This will:

- Set up your Convex deployment
- Deploy the database schema and functions
- Start the Convex development server

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3004` with WebSocket server on port `3003`.

## 📁 Project Structure

```
server/
├── src/
│   ├── config/             # Configuration management
│   │   └── env.ts         # Environment variables
│   ├── middleware/         # Custom middleware
│   │   └── auth.ts        # Authentication middleware
│   ├── routes/            # API route handlers
│   │   ├── health.ts      # Health check endpoints
│   │   ├── monitoring.ts  # Monitoring endpoints
│   │   └── providers.ts   # Provider management
│   ├── services/          # Business logic services
│   │   ├── convexService.ts    # Convex database operations
│   │   ├── monitoringService.ts # Health monitoring logic
│   │   └── websocketService.ts  # WebSocket management
│   ├── types/             # TypeScript definitions
│   │   └── index.ts       # Shared type definitions
│   └── index.ts           # Application entry point
├── convex/                # Convex database functions
│   ├── schema.ts          # Database schema
│   ├── apiProviders.ts    # API provider functions
│   ├── healthChecks.ts    # Health check functions
│   └── auth.config.ts     # Authentication config
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## 🔧 Available Scripts

### Development

- `npm run dev` - Start development server with hot reload
- `npm run start:dev` - Start development server (alternative)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run clean` - Clean build directory

### Database

- `npm run convex:dev` - Start Convex development server
- `npm run convex:deploy` - Deploy Convex functions to production

## 🔐 Authentication

The backend uses Clerk for JWT authentication:

1. **JWT Validation**: All protected routes validate Clerk JWT tokens
2. **User Context**: Authenticated user information is available in route handlers
3. **Middleware**: Authentication middleware handles token validation

### Protected Routes

All API routes except `/health` require authentication:

- `GET /api/providers` - Get API providers
- `POST /api/providers` - Create API provider
- `PUT /api/providers/:id` - Update API provider
- `DELETE /api/providers/:id` - Delete API provider
- `GET /api/monitoring/*` - Monitoring endpoints

## 🌐 API Endpoints

### Health Check

- `GET /health` - System health status

### API Providers

- `GET /api/providers` - Get all providers for authenticated user
- `POST /api/providers` - Create new API provider
- `GET /api/providers/:id` - Get specific provider
- `PUT /api/providers/:id` - Update provider
- `DELETE /api/providers/:id` - Delete provider

### Monitoring

- `GET /api/monitoring/providers/:id/history` - Get health check history
- `GET /api/monitoring/providers/:id/stats` - Get provider statistics
- `POST /api/monitoring/providers/:id/check` - Trigger manual health check

### WebSocket

- `ws://localhost:3003/ws` - Real-time status updates

## 🔄 Isolated Environment

This server runs completely independently from the client:

1. **Separate Database Functions**: Has its own Convex functions in `/convex` folder
2. **Independent Deployment**: Can be deployed separately from client
3. **API Communication**: Client communicates via HTTP/WebSocket APIs
4. **Environment Isolation**: Separate environment variables and configuration

### Running Both Servers

To run both client and server simultaneously:

1. **Terminal 1 (Server)**:

   ```bash
   cd server
   npm run dev
   ```

2. **Terminal 2 (Client)**:

   ```bash
   cd client
   npm run dev
   ```

3. **Terminal 3 (Server Convex)**:

   ```bash
   cd server
   npm run convex:dev
   ```

4. **Terminal 4 (Client Convex)**:
   ```bash
   cd client
   npm run convex:dev
   ```

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
WS_PORT=3002

# Use production Convex deployment
CONVEX_DEPLOYMENT=your-production-deployment
CONVEX_URL=https://your-production-deployment.convex.cloud

# Use production Clerk keys
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
CLERK_SECRET_KEY=sk_live_your-live-secret

# Production monitoring settings
MONITORING_INTERVAL=60000
MONITORING_TIMEOUT=15000
MAX_CONCURRENT_CHECKS=20

# Production circuit breaker settings
CIRCUIT_BREAKER_FAILURE_THRESHOLD=10
CIRCUIT_BREAKER_TIMEOUT=120000
CIRCUIT_BREAKER_RESET_TIMEOUT=600000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Hono.js Documentation](https://hono.dev/)
2. Check the [Convex Documentation](https://docs.convex.dev/)
3. Check the [Clerk Documentation](https://docs.clerk.dev/)
4. Review the environment variables setup
5. Check server logs for error messages

## 🔗 Related

- [Client Repository](../client/) - The React frontend
- [Hono.js Documentation](https://hono.dev/)
- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Documentation](https://docs.clerk.dev/)
