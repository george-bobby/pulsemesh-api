import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useUserProfile() {
  const { user } = useUser();

  // Get user profile from Convex
  const profile = useQuery(
    api.userProfiles.get,
    user ? { userId: user.id } : "skip"
  );

  // Create or update user profile
  const createOrUpdateProfile = useMutation(api.userProfiles.createOrUpdate);

  // Update user profile
  const updateProfile = useMutation(api.userProfiles.update);

  // Update last login
  const updateLastLogin = useMutation(api.userProfiles.updateLastLogin);

  // Get user stats
  const userStats = useQuery(
    api.userProfiles.getUserStats,
    user ? { userId: user.id } : "skip"
  );

  // Auto-create profile when user signs in
  const ensureProfile = async () => {
    if (user && !profile) {
      await createOrUpdateProfile({
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || user.firstName || "Unknown User",
        profileImageUrl: user.imageUrl || undefined,
      });
    }
  };

  // Update login timestamp
  const recordLogin = async () => {
    if (user) {
      await updateLastLogin({ userId: user.id });
    }
  };

  return {
    user,
    profile,
    userStats,
    ensureProfile,
    recordLogin,
    updateProfile,
    isLoading: profile === undefined && user !== null,
  };
}
