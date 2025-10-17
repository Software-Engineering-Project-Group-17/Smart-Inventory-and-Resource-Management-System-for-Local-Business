import { authenticatedFetch } from "@/lib/authenticated-fetch";

export interface BranchUser {
  userId: number;
  email: string;
  name: string;
  isActive?: boolean;
  isUserActive?: boolean;
  isStaffActive?: boolean;
  accountStatus: string;
  lastLogin?: string;
  createdAt: string;
  role: string;
  branchName: string;
  // Manager-specific fields
  managerStatus?: "CURRENT" | "PREVIOUS";
  // Staff-specific fields
  staffId?: number;
  firstName?: string;
  lastName?: string;
  staffTypes?: string[];
  salary?: number;
  hireDate?: string;
}

export interface BranchUsersResponse {
  success: boolean;
  data: {
    branch: {
      id: number;
      name: string;
      location: string;
    };
    branchManagers: BranchUser[];
    staff: BranchUser[];
    counts: {
      totalManagers: number;
      activeManagers: number;
      totalStaff: number;
      activeStaff: number;
    };
  };
}

export interface DeactivateUserResponse {
  success: boolean;
  message: string;
  data?: {
    userId: number;
    name: string;
    email: string;
    role: string;
    branchId: number;
    staffId?: number;
    deactivatedAt: string;
    deactivatedBy: string;
  };
}

// API functions for branch user management
export const branchUsersAPI = {
  // Get users (managers and staff) for a specific branch
  getBranchUsers: async (branchId: number): Promise<BranchUsersResponse> => {
    const response = await authenticatedFetch(
      `/api/branches/${branchId}/users`
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to fetch branch users" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // Deactivate a branch user (manager or staff)
  deactivateUser: async (userId: number): Promise<DeactivateUserResponse> => {
    const response = await authenticatedFetch(
      `/api/branches/users/deactivate/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to deactivate user" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // Get aggregated counts for all branches owned by the current user
  getBranchCounts: async (): Promise<{
    [branchId: string]: {
      managers: number;
      staff: number;
      activeManagers: number;
      activeStaff: number;
    };
  }> => {
    // This would need to be implemented to get counts for all branches at once
    // For now, it would require calling getBranchUsers for each branch
    // You could create a separate API endpoint for this if needed
    throw new Error(
      "Not implemented yet - use getBranchUsers for individual branches"
    );
  },
};
