import { createMiddleware } from 'hono/factory';
import { verifyToken } from '@clerk/backend';
import { env } from '../config/env.js';
import { ApiError, AuthenticatedUser } from '../types/index.js';

// Extend Hono's Context to include user information
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthenticatedUser;
  }
}

// Authentication middleware
export const authMiddleware = createMiddleware(async (c, next) => {
  try {
    // Get the authorization header
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Missing or invalid authorization header', 401);
    }

    // Extract the token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Clerk
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
      issuer: env.CLERK_JWT_ISSUER_DOMAIN,
    });

    if (!payload || !payload.sub) {
      throw new ApiError('Invalid token', 401);
    }

    // Extract user information from the token
    const user: AuthenticatedUser = {
      userId: payload.sub,
      email: payload.email as string || '',
      name: payload.name as string || payload.given_name as string || '',
    };

    // Set user in context
    c.set('user', user);

    await next();
  } catch (error) {
    if (error instanceof ApiError) {
      return c.json({ 
        success: false, 
        error: error.message,
        timestamp: Date.now()
      }, error.statusCode);
    }

    console.error('Authentication error:', error);
    return c.json({ 
      success: false, 
      error: 'Authentication failed',
      timestamp: Date.now()
    }, 401);
  }
});

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthMiddleware = createMiddleware(async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const payload = await verifyToken(token, {
          secretKey: env.CLERK_SECRET_KEY,
          issuer: env.CLERK_JWT_ISSUER_DOMAIN,
        });

        if (payload && payload.sub) {
          const user: AuthenticatedUser = {
            userId: payload.sub,
            email: payload.email as string || '',
            name: payload.name as string || payload.given_name as string || '',
          };

          c.set('user', user);
        }
      } catch (error) {
        // Ignore token verification errors for optional auth
        console.warn('Optional auth token verification failed:', error.message);
      }
    }

    await next();
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    await next();
  }
});

// Helper function to get user from context
export const getUser = (c: any): AuthenticatedUser | null => {
  return c.get('user') || null;
};

// Helper function to require authenticated user
export const requireUser = (c: any): AuthenticatedUser => {
  const user = c.get('user');
  if (!user) {
    throw new ApiError('Authentication required', 401);
  }
  return user;
};
