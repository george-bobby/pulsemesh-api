# PulseMesh API - Isolated Client/Server Architecture

A comprehensive API monitoring system with **completely isolated** client and server environments. The client is a modern React frontend, and the server is a robust Hono.js backend, both running independently with their own Convex database functions.

## 🏗️ Architecture Overview

```
pulsemesh-api/
├── client/                 # React Frontend (Port 8080)
│   ├── src/               # React components and pages
│   ├── convex/            # Client-side Convex functions
│   ├── package.json       # Client dependencies
│   └── README.md          # Client documentation
│
├── server/                # Hono.js Backend (Port 3001)
│   ├── src/               # Server routes and services
│   ├── convex/            # Server-side Convex functions
│   ├── package.json       # Server dependencies
│   └── README.md          # Server documentation
│
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account and deployment
- Clerk account and application

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd pulsemesh-api
```

### 2. Install Dependencies

**Client:**
```bash
cd client
npm install
```

**Server:**
```bash
cd server
npm install
```

### 3. Environment Configuration

**Client Environment:**
```bash
cd client
cp .env.example .env.local
# Edit .env.local with your configuration
```

**Server Environment:**
```bash
cd server
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 4. Start Both Servers

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```
Server will start on `http://localhost:3004`

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```
Client will start on `http://localhost:8080`

**Terminal 3 - Server Convex:**
```bash
cd server
npm run convex:dev
```

**Terminal 4 - Client Convex:**
```bash
cd client
npm run convex:dev
```

## 🔄 Isolated Environment Features

### ✅ Complete Independence

- **Separate Codebases**: Client and server have completely separate source code
- **Independent Dependencies**: Each has its own package.json and node_modules
- **Isolated Databases**: Separate Convex functions for client and server operations
- **Environment Isolation**: Separate .env files and configuration
- **Independent Deployment**: Can be deployed to different servers/platforms

### ✅ API Communication

- **HTTP API**: Client communicates with server via RESTful API
- **WebSocket**: Real-time updates via WebSocket connection
- **CORS Configured**: Server accepts requests from client origin
- **Authentication**: Shared Clerk authentication via JWT tokens

### ✅ Database Architecture

**Client Convex Functions:**
- User-facing operations with authentication
- Frontend data queries and mutations
- Real-time subscriptions for UI updates

**Server Convex Functions:**
- Internal operations without authentication requirements
- Background monitoring and health checks
- System-level data management

## 📊 System Components

### Client (React Frontend)

- **Port**: 8080
- **Framework**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Authentication**: Clerk
- **Database**: Convex (client functions)
- **Real-time**: WebSocket client

**Key Features:**
- Real-time dashboard
- API provider management
- Analytics and charts
- User authentication
- Responsive design

### Server (Hono.js Backend)

- **Port**: 3004 (HTTP) + 3003 (WebSocket)
- **Framework**: Hono.js + TypeScript
- **Authentication**: Clerk JWT validation
- **Database**: Convex (server functions)
- **Monitoring**: Automated health checks

**Key Features:**
- RESTful API endpoints
- WebSocket server for real-time updates
- Automated API monitoring
- Circuit breaker patterns
- Background job scheduling

## 🌐 API Endpoints

### Server API (http://localhost:3004)

- `GET /health` - Server health status
- `GET /api/providers` - Get API providers
- `POST /api/providers` - Create API provider
- `PUT /api/providers/:id` - Update API provider
- `DELETE /api/providers/:id` - Delete API provider
- `GET /api/monitoring/providers/:id/history` - Health check history

### WebSocket (ws://localhost:3003/ws)

- Real-time status updates
- Health check results
- Provider status changes

## 🔐 Authentication Flow

1. **User Authentication**: Clerk handles user sign-in/sign-up
2. **JWT Tokens**: Client receives JWT token from Clerk
3. **API Requests**: Client sends JWT token in Authorization header
4. **Server Validation**: Server validates JWT token with Clerk
5. **Database Access**: Authenticated requests access Convex database

## 🚀 Deployment

### Client Deployment

```bash
cd client
npm run build
# Deploy dist/ folder to Vercel, Netlify, etc.
```

### Server Deployment

```bash
cd server
npm run build
npm start
# Deploy to Railway, Render, AWS, etc.
```

### Environment Variables

**Client Production:**
```env
VITE_CONVEX_URL=https://your-production-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your-live-key
VITE_API_BASE_URL=https://your-server-domain.com
VITE_WS_URL=wss://your-server-domain.com/ws
```

**Server Production:**
```env
CONVEX_URL=https://your-production-deployment.convex.cloud
CLERK_SECRET_KEY=sk_live_your-live-secret
PORT=3001
WS_PORT=3002
NODE_ENV=production
```

## 📚 Documentation

- **[Client Documentation](client/README.md)** - React frontend setup and usage
- **[Server Documentation](server/README.md)** - Hono.js backend setup and API reference
- **[Setup Verification](test-setup.md)** - Testing the isolated environment

## 🔧 Development Workflow

### Adding New Features

**Client-side Features:**
1. Work in `client/` directory
2. Add React components, pages, hooks
3. Update client Convex functions if needed
4. Test with `npm run dev` in client directory

**Server-side Features:**
1. Work in `server/` directory
2. Add routes, services, middleware
3. Update server Convex functions if needed
4. Test with `npm run dev` in server directory

### Database Changes

**Schema Updates:**
1. Update `client/convex/schema.ts` for client functions
2. Update `server/convex/schema.ts` for server functions
3. Deploy with `npm run convex:deploy` in respective directories