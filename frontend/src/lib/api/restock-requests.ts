import { getUserProfile } from "@/lib/auth";
import {
  RestockRequestFilters,
  RestockRequestResponse,
  CreateRestockRequest,
} from "@/types/restock";

// Helper function to get user headers for API requests
function getUserHeaders(): HeadersInit {
  const userProfile = getUserProfile();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (userProfile) {
    headers["x-user-id"] = userProfile.id;
    headers["x-user-email"] = userProfile.email;
    headers["x-user-role"] = userProfile.role;
  }

  return headers;
}

export const restockRequestApi = {
  // Get restock requests with optional filters
  async getAll(
    filters?: RestockRequestFilters
  ): Promise<RestockRequestResponse> {
    try {
      const headers = getUserHeaders();
      const params = new URLSearchParams();

      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/restock-requests?${params}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Restock requests API error:", error);
      throw error;
    }
  },

  // Create a new restock request
  async create(
    data: CreateRestockRequest
  ): Promise<{ success: boolean; request: any }> {
    try {
      const headers = getUserHeaders();

      const response = await fetch("/api/restock-requests", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Create restock request API error:", error);
      throw error;
    }
  },

  // Get a specific restock request by ID
  async getById(id: number): Promise<any> {
    try {
      const headers = getUserHeaders();

      const response = await fetch(`/api/restock-requests/${id}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Get restock request API error:", error);
      throw error;
    }
  },

  // Update a restock request
  async update(
    id: number,
    data: Partial<CreateRestockRequest>
  ): Promise<{ success: boolean }> {
    try {
      const headers = getUserHeaders();

      const response = await fetch(`/api/restock-requests/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Update restock request API error:", error);
      throw error;
    }
  },

  // Delete a restock request
  async delete(id: number): Promise<{ success: boolean }> {
    try {
      const headers = getUserHeaders();

      const response = await fetch(`/api/restock-requests/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Delete restock request API error:", error);
      throw error;
    }
  },

  // Update restock request status
  async updateStatus(
    id: number,
    status: "pending" | "active" | "completed" | "cancelled"
  ): Promise<{ success: boolean }> {
    try {
      const headers = getUserHeaders();

      const response = await fetch(`/api/restock-requests/${id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Update restock request status API error:", error);
      throw error;
    }
  },
};
