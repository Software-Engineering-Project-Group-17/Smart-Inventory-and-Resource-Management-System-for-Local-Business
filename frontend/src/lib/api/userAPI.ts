// API client for user-related operations
import { getUserProfile } from "@/lib/auth";

export interface UserBranchInfo {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  branchId: number;
  branchName: string;
  branchLocation: string;
  role: string;
}

export const userApi = {
  // Get current user's branch information
  async getCurrentUserBranch(): Promise<UserBranchInfo> {
    const userProfile = getUserProfile();
    if (!userProfile) {
      throw new Error("User not authenticated");
    }

    const response = await fetch("/api/user/branch", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userProfile.id,
        "x-user-email": userProfile.email,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch user branch info");
    }

    return response.json();
  },
};
