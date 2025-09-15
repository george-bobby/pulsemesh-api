import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { serve } from "@hono/node-server";

// Import configuration
import { env, isDevelopment } from "./config/env.js";

// Import services
import { monitoringService } from "./services/monitoringService.js";

// Import routes
import healthRoutes from "./routes/health.js";
import providerRoutes from "./routes/providers.js";
import monitoringRoutes from "./routes/monitoring.js";
import { users as userRoutes } from "./routes/users.js";

// Import types
import { ApiResponse, ApiError } from "./types/index.js";

// Create Hono app
const app = new Hono();

// Global middleware
app.use("*", logger());
app.use("*", prettyJSON());

// CORS configuration
app.use(
  "*",
  cors({
    origin: isDevelopment()
      ? ["http://localhost:8080", "http://localhost:3000"]
      : [],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Global error handler
app.onError((err, c) => {
  console.error("Global error handler:", err);

  if (err instanceof ApiError) {
    const response: ApiResponse = {
      success: false,
      error: err.message,
      timestamp: Date.now(),
    };
    return c.json(response, err.statusCode as any);
  }

  const response: ApiResponse = {
    success: false,
    error: isDevelopment() ? err.message : "Internal server error",
    timestamp: Date.now(),
  };

  return c.json(response, 500);
});

// 404 handler
app.notFound((c) => {
  const response: ApiResponse = {
    success: false,
    error: "Not found",
    timestamp: Date.now(),
  };

  return c.json(response, 404);
});

// Root endpoint
app.get("/", (c) => {
  const response: ApiResponse = {
    success: true,
    data: {
      name: "PulseMesh API Backend",
      version: "1.0.0",
      environment: env.NODE_ENV,
      timestamp: Date.now(),
      endpoints: {
        health: "/health",
        providers: "/api/providers",
        monitoring: "/api/monitoring",
        users: "/api/users",
        websocket: `ws://localhost:3003/ws`,
      },
    },
    timestamp: Date.now(),
  };

  return c.json(response);
});

// Mount routes
app.route("/health", healthRoutes);
app.route("/api/providers", providerRoutes);
app.route("/api/monitoring", monitoringRoutes);
app.route("/api/users", userRoutes);

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  try {
    // Stop monitoring service
    await monitoringService.stop();
    console.log("Monitoring service stopped");

    console.log("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start services and server
async function startServer() {
  try {
    console.log("Starting PulseMesh API Backend...");
    console.log(`Environment: ${env.NODE_ENV}`);
    console.log(`Port: ${env.PORT}`);

    // Start monitoring service
    await monitoringService.start();

    // Start HTTP server
    console.log(`Starting HTTP server on port ${env.PORT}...`);

    serve({
      fetch: app.fetch,
      port: env.PORT,
    });

    console.log(`✅ PulseMesh API Backend started successfully!`);
    console.log(`🌐 HTTP Server: http://localhost:${env.PORT}`);
    console.log(`📊 Health Check: http://localhost:${env.PORT}/health`);

    if (isDevelopment()) {
      console.log(`🔧 Development mode enabled`);
      console.log(`📝 API Documentation: http://localhost:${env.PORT}/`);
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

// Start the server
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

export default app;
