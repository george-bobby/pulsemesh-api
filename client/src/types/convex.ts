// Manual type definitions for Convex API
// These replace the generated types from convex/_generated/

// Generic ID type replacement
export type Id<T extends string> = string & { __tableName: T };

// API Provider types
export interface ApiProvider {
  _id: Id<"apiProviders">;
  _creationTime: number;
  name: string;
  type: string;
  endpoint: string;
  isHealthy: boolean;
  latency: number;
  errorRate: number;
  priority: number;
  isPrimary?: boolean;
  lastCheck: string;
  userId: string;
}

// User Profile types
export interface UserProfile {
  _id: Id<"userProfiles">;
  _creationTime: number;
  userId: string;
  email: string;
  name: string;
  profileImageUrl?: string;
  createdAt: number;
  lastLoginAt: number;
}

// Message types
export interface Message {
  _id: Id<"messages">;
  _creationTime: number;
  body: string;
  title: string;
  author: string;
  authorName: string;
  createdAt: number;
}

// Health Check types
export interface HealthCheckResult {
  _id: Id<"healthChecks">;
  _creationTime: number;
  providerId: Id<"apiProviders">;
  timestamp: number;
  isHealthy: boolean;
  latency: number;
  statusCode?: number;
  errorMessage?: string;
  responseTime: number;
  status?: 'healthy' | 'degraded' | 'down';
}

// User Stats types
export interface UserStats {
  profile: UserProfile | null;
  stats: {
    providerCount: number;
    healthChecksLastWeek: number;
    accountAge: number;
  };
}

// Manual API object structure
// This replaces the generated api object from convex/_generated/api
export const api = {
  apiProviders: {
    create: "apiProviders:create" as const,
    get: "apiProviders:get" as const,
    getByUser: "apiProviders:getByUser" as const,
    getAll: "apiProviders:getAll" as const,
    update: "apiProviders:update" as const,
    updateHealth: "apiProviders:updateHealth" as const,
    deleteProvider: "apiProviders:deleteProvider" as const,
    getProvidersForHealthCheck: "apiProviders:getProvidersForHealthCheck" as const,
  },
  userProfiles: {
    createOrUpdate: "userProfiles:createOrUpdate" as const,
    get: "userProfiles:get" as const,
    getAll: "userProfiles:getAll" as const,
    update: "userProfiles:update" as const,
    deleteUser: "userProfiles:deleteUser" as const,
    updateLastLogin: "userProfiles:updateLastLogin" as const,
    getUserStats: "userProfiles:getUserStats" as const,
  },
  messages: {
    getForCurrentUser: "messages:getForCurrentUser" as const,
    getAllMessages: "messages:getAllMessages" as const,
    sendMessage: "messages:sendMessage" as const,
    getUserProfile: "messages:getUserProfile" as const,
  },
  healthChecks: {
    create: "healthChecks:create" as const,
    getHistory: "healthChecks:getHistory" as const,
    getLatest: "healthChecks:getLatest" as const,
    getLatestForAllProviders: "healthChecks:getLatestForAllProviders" as const,
    getRecentChecks: "healthChecks:getRecentChecks" as const,
    getStats: "healthChecks:getStats" as const,
    cleanup: "healthChecks:cleanup" as const,
  },
} as const;

