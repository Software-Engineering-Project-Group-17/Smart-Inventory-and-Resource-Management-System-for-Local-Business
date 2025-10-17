"use client";
import { useState, useEffect } from "react";
import {
  branchUsersAPI,
  BranchUser,
  BranchUsersResponse,
} from "@/lib/api/branchUsers";
import { toastUtils } from "@/lib/toast-utils";

export interface UseBranchUsersResult {
  // Data
  branchUsers: BranchUsersResponse["data"] | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBranchUsers: (branchId: number) => Promise<void>;
  deactivateUser: (
    userId: number,
    userName: string,
    role: string
  ) => Promise<void>;
  reactivateUser: (
    userId: number,
    userName: string,
    role: string
  ) => Promise<void>;
  refreshData: () => Promise<void>;

  // UI State
  isDeactivating: boolean;
  isReactivating: boolean;
}

export const useBranchUsers = (
  initialBranchId?: number
): UseBranchUsersResult => {
  const [branchUsers, setBranchUsers] = useState<
    BranchUsersResponse["data"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useState<number | null>(
    initialBranchId || null
  );

  // Fetch branch users
  const fetchBranchUsers = async (branchId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentBranchId(branchId);

      console.log(`🔍 Fetching users for branch ID: ${branchId}`);

      const response = await branchUsersAPI.getBranchUsers(branchId);

      if (response.success) {
        setBranchUsers(response.data);
      } else {
        throw new Error("Failed to fetch branch users");
      }
    } catch (error) {
      console.error("Error fetching branch users:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load branch users";
      setError(errorMessage);
      toastUtils.dataError("fetch branch users", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate a user
  const deactivateUser = async (
    userId: number,
    userName: string,
    role: string
  ) => {
    try {
      setIsDeactivating(true);

      console.log(`🚫 Deactivating ${role}: ${userName} (ID: ${userId})`);

      const response = await branchUsersAPI.deactivateUser(userId);

      if (response.success) {
        // Refresh the data to show updated status
        if (currentBranchId) {
          await fetchBranchUsers(currentBranchId);
        }

        toastUtils.formSuccess(
          "User Deactivated",
          `${role} ${userName} has been deactivated successfully`
        );
      } else {
        throw new Error(response.message || "Failed to deactivate user");
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to deactivate user";
      toastUtils.formError("Deactivate User", errorMessage);
    } finally {
      setIsDeactivating(false);
    }
  };

  // Reactivate a user
  const reactivateUser = async (
    userId: number,
    userName: string,
    role: string
  ) => {
    try {
      setIsReactivating(true);

      console.log(`🔄 Reactivating ${role}: ${userName} (ID: ${userId})`);

      const response = await branchUsersAPI.reactivateUser(userId);

      if (response.success) {
        // Refresh the data to show updated status
        if (currentBranchId) {
          await fetchBranchUsers(currentBranchId);
        }

        toastUtils.formSuccess(
          "User Reactivated",
          `${role} ${userName} has been reactivated successfully`
        );
      } else {
        throw new Error(response.message || "Failed to reactivate user");
      }
    } catch (error) {
      console.error("Error reactivating user:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reactivate user";
      toastUtils.formError("Reactivate User", errorMessage);
    } finally {
      setIsReactivating(false);
    }
  };

  // Refresh current data
  const refreshData = async () => {
    if (currentBranchId) {
      await fetchBranchUsers(currentBranchId);
    }
  };

  // Load initial data if branchId provided
  useEffect(() => {
    if (initialBranchId) {
      fetchBranchUsers(initialBranchId);
    }
  }, [initialBranchId]);

  return {
    branchUsers,
    isLoading,
    error,
    fetchBranchUsers,
    deactivateUser,
    reactivateUser,
    refreshData,
    isDeactivating,
    isReactivating,
  };
};
