# PulseMesh API Client

A modern React frontend for the PulseMesh API monitoring system with real-time health checking, beautiful UI components, and comprehensive dashboard features.

## 🚀 Features

- **Real-time Dashboard**: Live API monitoring with instant status updates
- **Beautiful UI**: Modern design with shadcn/ui components and Tailwind CSS
- **Authentication**: Secure user authentication with Clerk
- **Real-time Updates**: WebSocket integration for live status changes
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **API Management**: Complete CRUD operations for API providers
- **Analytics**: Comprehensive monitoring analytics and charts
- **Dark/Light Mode**: Theme switching support

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Recharts** - Data visualization
- **Clerk** - Authentication and user management
- **Convex** - Real-time database

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
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Authentication Configuration
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key
CLERK_SECRET_KEY=sk_test_your-secret-key

# Backend API Configuration (if using separate server)
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3002/ws
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

The application will be available at `http://localhost:8080`

## 📁 Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Navigation.tsx  # Main navigation
│   │   ├── UserProfile.tsx # User profile component
│   │   └── ...
│   ├── pages/              # Application pages/routes
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Providers.tsx   # API providers management
│   │   ├── Analytics.tsx   # Analytics and charts
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── main.tsx           # Application entry point
├── convex/                 # Convex database functions
│   ├── schema.ts          # Database schema
│   ├── apiProviders.ts    # API provider functions
│   ├── healthChecks.ts    # Health check functions
│   └── auth.config.ts     # Authentication config
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Database
- `npm run convex:dev` - Start Convex development server
- `npm run convex:deploy` - Deploy Convex functions to production

## 🔐 Authentication Setup

This application uses Clerk for authentication. Follow these steps:

1. **Create a Clerk Application**
   - Go to [Clerk Dashboard](https://dashboard.clerk.dev/)
   - Create a new application
   - Get your publishable key and secret key

2. **Configure JWT Template**
   - In Clerk Dashboard, go to JWT Templates
   - Create a new template named "convex"
   - Set the issuer to your Clerk domain

3. **Environment Variables**
   - Add your Clerk keys to `.env.local`
   - Make sure `CLERK_JWT_ISSUER_DOMAIN` matches your Clerk domain

## 🌐 Routing

The application uses React Router with the following routes:

- `/` - Redirects to `/dashboard` if authenticated, `/home` if not
- `/home` - Public landing page
- `/dashboard` - Main dashboard (protected)
- `/providers` - API providers management (protected)
- `/analytics` - Analytics and charts (protected)
- `/alerts` - Alert management (protected)
- `/settings` - User settings (protected)

## 🎨 UI Components

The application uses shadcn/ui components for a consistent and beautiful design:

- **Navigation** - Responsive sidebar navigation
- **Dashboard Cards** - Status cards with real-time updates
- **Data Tables** - Sortable and filterable tables
- **Charts** - Interactive charts with Recharts
- **Forms** - Accessible forms with validation
- **Modals** - Modal dialogs for actions

## 📊 Real-time Features

- **Live Status Updates** - API status changes appear instantly
- **WebSocket Connection** - Real-time communication with backend
- **Automatic Refresh** - Data refreshes automatically
- **Connection Status** - Shows connection status to backend

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build the project
npm run build

# Deploy the dist folder to Netlify
```

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

```env
CONVEX_DEPLOYMENT=your-production-deployment
VITE_CONVEX_URL=https://your-production-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your-live-key
CLERK_SECRET_KEY=sk_live_your-live-secret
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_WS_URL=wss://your-backend-domain.com/ws
```

## 🔧 Configuration

### Vite Configuration

The Vite configuration includes:
- React plugin with SWC
- Path aliases (`@/` for `src/`)
- Development server on port 8080

### TypeScript Configuration

- Strict type checking enabled
- Path mapping for clean imports
- Modern ES2020 target

### Tailwind Configuration

- Custom color scheme
- shadcn/ui integration
- Responsive design utilities

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

1. Check the [Convex Documentation](https://docs.convex.dev/)
2. Check the [Clerk Documentation](https://docs.clerk.dev/)
3. Review the environment variables setup
4. Make sure the backend server is running (if using separate server)

## 🔗 Related

- [Server Repository](../server/) - The backend API server
- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Documentation](https://docs.clerk.dev/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
