import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { convexService } from "../services/convexService.js";
import {
  CreateUserProfileSchema,
  UpdateUserProfileSchema,
  ApiError,
} from "../types/index.js";
import { authMiddleware } from "../middleware/auth.js";

const users = new Hono();

// Helper function to get proper status codes
const getStatusCode = (error: unknown): ContentfulStatusCode => {
  if (error instanceof ApiError) {
    return error.statusCode as ContentfulStatusCode;
  }
  return 500;
};

// Apply authentication middleware to all routes
users.use("/*", authMiddleware);

// Create or update user profile
users.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = CreateUserProfileSchema.parse(body);

    await convexService.createOrUpdateUserProfile(validatedData);

    return c.json({
      success: true,
      message: "User profile created/updated successfully",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return c.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        400
      );
    }

    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message =
      error instanceof ApiError ? error.message : "Internal server error";
    return c.json({ error: message }, statusCode as any);
  }
});

// Get current user profile
users.get("/profile", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const profile = await convexService.getUserProfile(user.userId);

    if (!profile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    return c.json(profile);
  } catch (error: any) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message =
      error instanceof ApiError ? error.message : "Internal server error";
    return c.json({ error: message }, statusCode as any);
  }
});

// Get user by ID (admin or self only)
users.get("/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const currentUser = c.get("user");

    if (!currentUser) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    // Users can only access their own profile (add admin check if needed)
    if (currentUser.userId !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const profile = await convexService.getUserProfile(userId);

    if (!profile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    return c.json(profile);
  } catch (error: any) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message =
      error instanceof ApiError ? error.message : "Internal server error";
    return c.json({ error: message }, statusCode as any);
  }
});

// Update user profile
users.put("/profile", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const body = await c.req.json();
    const validatedData = UpdateUserProfileSchema.parse(body);

    await convexService.updateUserProfile(user.userId, validatedData);

    return c.json({
      success: true,
      message: "User profile updated successfully",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return c.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        400
      );
    }

    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message =
      error instanceof ApiError ? error.message : "Internal server error";
    return c.json({ error: message }, statusCode as any);
  }
});

// Get user statistics
users.get("/profile/stats", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const stats = await convexService.getUserStats(user.userId);

    if (!stats) {
      return c.json({ error: "User profile not found" }, 404);
    }

    return c.json(stats);
  } catch (error: any) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message =
      error instanceof ApiError ? error.message : "Internal server error";
    return c.json({ error: message }, statusCode as any);
  }
});

// Update last login timestamp
users.post("/profile/login", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    await convexService.updateUserLastLogin(user.userId);

    return c.json({
      success: true,
      message: "Last login updated successfully",
    });
  } catch (error: any) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message =
      error instanceof ApiError ? error.message : "Internal server error";
    return c.json({ error: message }, statusCode as any);
  }
});

// Delete user profile
users.delete("/profile", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    await convexService.deleteUserProfile(user.userId);

    return c.json({
      success: true,
      message: "User profile deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message =
      error instanceof ApiError ? error.message : "Internal server error";
    return c.json({ error: message }, statusCode as any);
  }
});

export { users };
