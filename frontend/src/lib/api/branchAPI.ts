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

    // Check content type to determine how to parse the response
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      // If backend returns plain text, create a mock response
      const responseText = await response.text();
      console.log("Backend returned text response:", responseText);

      // Try to extract the actual ID from the response text
      const idMatch = responseText.match(/ID:\s*(\d+)/i);
      const actualId = idMatch ? parseInt(idMatch[1]) : Date.now();

      // Return a mock response for successful creation
      return {
        id: actualId,
        name: branchData.name,
        location: branchData.location,
        contactNumber: branchData.contactNumber,
        description: branchData.description,
        status: "ACTIVE",
        manager: null,
        createdAt: new Date().toISOString(),
      };
    }
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

  // Get the authenticated user's specific branch (recommended for PDF generation)
  async getMyBranch(userEmail?: string): Promise<BranchResponse> {
    // Try the Next.js internal API first
    try {
      let url = `/api/branches/my-branch`;
      if (userEmail) {
        url += `?email=${encodeURIComponent(userEmail)}`;
      }
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail || "",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Internal API failed: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success && result.branch) {
        return result.branch;
      } else {
        throw new Error(`Internal API returned no branch: ${JSON.stringify(result)}`);
      }
    } catch (internalError) {
      console.log("Internal API failed, trying external API:", internalError);
      
      // Fallback to external API
      if (!userEmail) {
        throw new Error("User email required for external API fallback");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/branches/my-branch`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user's branch from external API");
      }

      const result = await response.json();
      return result.branch || result; // Handle different response formats
    }
  }

  // Get branches by owner email (for current implementation)
  async getBranchesByOwner(ownerEmail: string): Promise<BranchResponse[]> {
    // Try the authenticated endpoint first
    try {
      console.log("Trying authenticated branches endpoint...");
      const response = await fetch(`${API_BASE_URL}/api/branches`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Authenticated endpoint failed:", errorText);
        throw new Error(errorText);
      }

      const result = await response.json();
      console.log("Authenticated endpoint success:", result);

      // The backend now returns {branches: [...]} instead of [...]
      if (result && result.branches && Array.isArray(result.branches)) {
        return result.branches;
      } else {
        throw new Error("Invalid response format from authenticated endpoint");
      }
    } catch (error) {
      console.log("Falling back to debug endpoint due to error:", error);
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
    console.log("Using debug endpoint for owner:", ownerEmail);
    const response = await fetch(
      `${API_BASE_URL}/api/branches/debug/owner/${encodeURIComponent(
        ownerEmail
      )}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Debug endpoint failed:", errorText);
      throw new Error("Failed to fetch branches for owner: " + errorText);
    }

    const result = await response.json();
    console.log("Debug endpoint success:", result);

    // The backend now returns {branches: [...]} instead of [...]
    if (result && result.branches && Array.isArray(result.branches)) {
      return result.branches;
    } else {
      throw new Error("Invalid response format from debug endpoint");
    }
  }
}

export const branchAPI = new BranchAPI();
