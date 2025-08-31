// API utility for branch management
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";

export interface BranchCreateRequest {
  name: string;
  location: string;
  contactNumber: string;
  description: string;
}

export interface BranchResponse {
  id: number;
  name: string;
  location: string;
  contactNumber: string;
  description: string;
  status: string;
  manager: any;
  createdAt: string;
}

class BranchAPI {
  private getAuthHeaders() {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Create a new branch
  async createBranch(branchData: BranchCreateRequest): Promise<BranchResponse> {
    const response = await fetch(`${API_BASE_URL}/api/branches`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(branchData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create branch");
    }

    return response.json();
  }

  // Get branches for current authenticated user
  async getBranches(): Promise<BranchResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/branches`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch branches");
    }

    return response.json();
  }

  // Get branches by owner email (for current implementation)
  async getBranchesByOwner(ownerEmail: string): Promise<BranchResponse[]> {
    // Try the authenticated endpoint first, fallback to debug endpoint
    try {
      return await this.getBranches();
    } catch (error) {
      // Fallback to debug endpoint
      return await this.getDebugBranchesByOwner(ownerEmail);
    }
  }

  // Test create branch (for development/testing)
  async testCreateBranch(
    branchData: BranchCreateRequest,
    ownerEmail: string
  ): Promise<string> {
    const response = await fetch(
      `${API_BASE_URL}/api/branches/test/create?ownerEmail=${encodeURIComponent(
        ownerEmail
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(branchData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create branch");
    }

    return response.text();
  }

  // Get branches (debug endpoint for development)
  async getDebugBranches(): Promise<BranchResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/branches/debug/all`);

    if (!response.ok) {
      throw new Error("Failed to fetch branches");
    }

    return response.json();
  }

  // Get branches by owner email (debug endpoint for development)
  async getDebugBranchesByOwner(ownerEmail: string): Promise<BranchResponse[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/branches/debug/owner/${encodeURIComponent(
        ownerEmail
      )}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch branches for owner");
    }

    return response.json();
  }
}

export const branchAPI = new BranchAPI();
