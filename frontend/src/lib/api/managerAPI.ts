// API utility for manager management
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";

export interface CreateManagerRequest {
  creatorFirebaseUid: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  branchId: number;
}

export interface ManagerResponse {
  userId: number;
  firebaseUid: string;
  email: string;
  name: string;
  role: {
    id: number;
    role: string;
    description: string;
  };
  createdAt: string;
}

class ManagerAPI {
  private getAuthHeaders() {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Create a new manager
  async createManager(managerData: CreateManagerRequest): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/roles/manager`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(managerData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create manager");
    }

    return response.text(); // Returns success message
  }

  // Get managers for a specific branch
  async getManagersByBranch(branchId: number): Promise<ManagerResponse[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/managers/branch/${branchId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch managers");
    }

    return response.json();
  }

  // Get all managers for current owner
  async getManagers(): Promise<ManagerResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/managers`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch managers");
    }

    return response.json();
  }
}

export const managerAPI = new ManagerAPI();
