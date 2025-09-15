import { z } from "zod";

// API Provider Types
export const ApiProviderSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  endpoint: z.string().url("Must be a valid URL"),
  isHealthy: z.boolean().default(false),
  latency: z.number().default(0),
  errorRate: z.number().default(0),
  priority: z.number().default(1),
  isPrimary: z.boolean().optional(),
  lastCheck: z.string().default(() => new Date().toISOString()),
  userId: z.string().min(1, "User ID is required"),
});

export type ApiProvider = z.infer<typeof ApiProviderSchema>;

// Health Check Result Types
export const HealthCheckResultSchema = z.object({
  providerId: z.string(),
  timestamp: z.number(),
  isHealthy: z.boolean(),
  latency: z.number(),
  statusCode: z.number().optional(),
  errorMessage: z.string().optional(),
  responseTime: z.number(),
});

export type HealthCheckResult = z.infer<typeof HealthCheckResultSchema>;

// Monitoring Configuration Types
export const MonitoringConfigSchema = z.object({
  interval: z.number().min(1000, "Interval must be at least 1000ms"),
  timeout: z.number().min(1000, "Timeout must be at least 1000ms"),
  retries: z.number().min(0).default(3),
  enabled: z.boolean().default(true),
});

export type MonitoringConfig = z.infer<typeof MonitoringConfigSchema>;

// WebSocket Message Types
export const WebSocketMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("status_update"),
    data: z.object({
      providerId: z.string(),
      isHealthy: z.boolean(),
      latency: z.number(),
      timestamp: z.number(),
    }),
  }),
  z.object({
    type: z.literal("provider_added"),
    data: ApiProviderSchema,
  }),
  z.object({
    type: z.literal("provider_updated"),
    data: ApiProviderSchema,
  }),
  z.object({
    type: z.literal("provider_removed"),
    data: z.object({
      providerId: z.string(),
    }),
  }),
  z.object({
    type: z.literal("heartbeat"),
    data: z.object({
      timestamp: z.number(),
    }),
  }),
]);

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

// API Response Types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.number().default(() => Date.now()),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
};

// Circuit Breaker State Types
export enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number;
  resetTimeout: number;
}

// Authentication Types
export interface AuthenticatedUser {
  userId: string;
  email: string;
  name?: string;
}

// User Profile Types
export const UserProfileSchema = z.object({
  _id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  email: z.string().email("Must be a valid email"),
  name: z.string().min(1, "Name is required"),
  profileImageUrl: z.string().url().optional(),
  createdAt: z.number(),
  lastLoginAt: z.number(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const CreateUserProfileSchema = UserProfileSchema.omit({
  _id: true,
  createdAt: true,
  lastLoginAt: true,
});

export type CreateUserProfile = z.infer<typeof CreateUserProfileSchema>;

export const UpdateUserProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  profileImageUrl: z.string().url().optional(),
});

export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;

// User Statistics Types
export interface UserStats {
  profile: UserProfile;
  stats: {
    providerCount: number;
    healthChecksLastWeek: number;
    accountAge: number;
  };
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Monitoring Statistics Types
export interface MonitoringStats {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageLatency: number;
  uptime: number;
  lastCheck: string;
}
