// API client functions for resource management

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

// Base API function
async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    return {
      success: false,
      message: "Network error occurred",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Resource API functions
export const resourceApi = {
  // Get all resources and assignments
  async getAll(
    branchId?: number
  ): Promise<
    ApiResponse<{ resources: ResourceData[]; assignments: AssignmentData[] }>
  > {
    const url = branchId
      ? `/api/resources?branch_id=${branchId}`
      : "/api/resources";
    return apiCall(url);
  },

  // Create a new resource
  async create(resourceData: {
    name: string;
    details: string;
    resourceType?: string;
    branchId: number;
  }): Promise<ApiResponse<ResourceData>> {
    return apiCall("/api/resources", {
      method: "POST",
      body: JSON.stringify(resourceData),
    });
  },

  // Update a resource
  async update(
    id: number,
    resourceData: {
      name: string;
      details: string;
      resourceType?: string;
    }
  ): Promise<ApiResponse<ResourceData>> {
    return apiCall("/api/resources", {
      method: "PUT",
      body: JSON.stringify({ id, ...resourceData }),
    });
  },

  // Delete a resource
  async delete(id: number): Promise<ApiResponse> {
    return apiCall(`/api/resources?id=${id}`, {
      method: "DELETE",
    });
  },
};

// Assignment API functions
export const assignmentApi = {
  // Assign a resource to staff
  async create(assignmentData: {
    resourceId: number;
    staffEmail: string;
    purpose: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  }): Promise<ApiResponse<AssignmentData>> {
    return apiCall("/api/resources/assignments", {
      method: "POST",
      body: JSON.stringify(assignmentData),
    });
  },

  // Unassign a resource
  async delete(assignmentId: number): Promise<ApiResponse> {
    return apiCall(`/api/resources/assignments?id=${assignmentId}`, {
      method: "DELETE",
    });
  },
};

// Staff API functions
export const staffApi = {
  // Get staff details by email
  async getByEmail(email: string): Promise<ApiResponse<StaffData>> {
    return apiCall(`/api/staff?email=${encodeURIComponent(email)}`);
  },
};

// Test database connection
export const testConnection = async (): Promise<ApiResponse> => {
  return apiCall("/api/test-connection");
};
