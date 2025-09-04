# PulseMesh API - API Resilience Management Platform

## Project Overview

A comprehensive API resilience management platform that provides real-time monitoring, circuit breaker patterns, failover capabilities, and analytics for distributed systems.

## Features

- **Real-time API Monitoring** - Live status tracking and health checks
- **Circuit Breaker Implementation** - Automatic failure detection and recovery
- **Failover Simulation** - Test your API resilience strategies  
- **Analytics Dashboard** - Performance metrics and insights
- **Provider Management** - Configure and monitor multiple API providers
- **Alert System** - Real-time notifications for system issues

## How to run locally

Follow these steps to get the project running on your local machine:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd pulsemesh-api

# Step 3: Install dependencies
npm i

# Step 4: Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn/ui** - Modern component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **React Query** - Server state management

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Application pages/routes
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
└── ...
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
