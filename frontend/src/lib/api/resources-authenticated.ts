// API client functions for resource management with authentication
import {
  authenticatedFetch,
  authenticatedPost,
  authenticatedFetchJson,
} from "@/lib/authenticated-fetch";

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface ResourceData {
  id: number;
  name: string;
  details: string;
  isAvailable: boolean;
  resourceNumber?: string;
  resourceType?: string;
  branchId?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AssignmentData {
  id: number;
  resourceId: number;
  resourceName: string;
  email: string;
  staffName: string;
  phone: string;
  purpose: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

interface StaffData {
  id: number;
  name: string;
  email: string;
  phone: string;
  branchId?: number;
  branchName?: string;
}

// Resource API functions
export const resourceApi = {
  // Get all resources and assignments
  async getAll(
    branchId?: number
  ): Promise<
    ApiResponse<{ resources: ResourceData[]; assignments: AssignmentData[] }>
  > {
    try {
      const url = branchId
        ? `/api/resources?branch_id=${branchId}`
        : "/api/resources";
      return await authenticatedFetchJson<
        ApiResponse<{
          resources: ResourceData[];
          assignments: AssignmentData[];
        }>
      >(url);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      return {
        success: false,
        message: "Failed to fetch resources",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // Create a new resource
  async create(data: {
    name: string;
    details: string;
    resourceType?: string;
  }): Promise<ApiResponse<ResourceData>> {
    try {
      return await authenticatedPost<ApiResponse<ResourceData>>(
        "/api/resources",
        data
      );
    } catch (error) {
      console.error("Failed to create resource:", error);
      return {
        success: false,
        message: "Failed to create resource",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // Delete a resource
  async delete(id: number): Promise<ApiResponse> {
    try {
      return await authenticatedFetchJson<ApiResponse>(
        `/api/resources?id=${id}`,
        {
          method: "DELETE",
        }
      );
    } catch (error) {
      console.error("Failed to delete resource:", error);
      return {
        success: false,
        message: "Failed to delete resource",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

// Assignment API functions
export const assignmentApi = {
  // Assign a resource to staff
  async create(data: {
    resourceId: number;
    staffEmail: string;
    purpose: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
  }): Promise<ApiResponse<AssignmentData>> {
    try {
      return await authenticatedPost<ApiResponse<AssignmentData>>(
        "/api/resources/assignments",
        data
      );
    } catch (error) {
      console.error("Failed to create assignment:", error);
      return {
        success: false,
        message: "Failed to create assignment",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // Unassign a resource
  async delete(id: number): Promise<ApiResponse> {
    try {
      return await authenticatedFetchJson<ApiResponse>(
        `/api/resources/assignments?id=${id}`,
        {
          method: "DELETE",
        }
      );
    } catch (error) {
      console.error("Failed to delete assignment:", error);
      return {
        success: false,
        message: "Failed to delete assignment",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

// Staff API functions
export const staffApi = {
  // Find staff by email
  async findByEmail(email: string): Promise<ApiResponse<StaffData>> {
    try {
      return await authenticatedFetchJson<ApiResponse<StaffData>>(
        `/api/staff?email=${encodeURIComponent(email)}`
      );
    } catch (error) {
      console.error("Failed to find staff:", error);
      return {
        success: false,
        message: "Failed to find staff",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

// Test connection
export const testConnection = async (): Promise<ApiResponse> => {
  try {
    return await authenticatedFetchJson<ApiResponse>("/api/test-auth");
  } catch (error) {
    console.error("Connection test failed:", error);
    return {
      success: false,
      message: "Connection test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
