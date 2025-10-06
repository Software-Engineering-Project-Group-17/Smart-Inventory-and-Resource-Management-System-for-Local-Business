// Inventory API types
export interface InventoryItem {
  inventoryId: number;
  itemName: string;
  barcode?: string;
  description?: string;
  categoryName: string;
  currentStock: number;
  reorderLevel: number;
  unitPrice: number;
  supplier?: string;
  lastUpdated: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
}

export interface Branch {
  branchId: number;
  name: string;
  location: string;
}

export interface InventoryResponse {
  inventory: InventoryItem[];
  categories: Category[];
  branch: Branch;
}

// API client functions for inventory management
import { getUserProfile } from "@/lib/auth";

// Helper function to get user headers for API requests (same pattern as resources)
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

// Inventory API functions
export const inventoryApi = {
  async getAll(): Promise<InventoryResponse> {
    try {
      const headers = getUserHeaders();
      const response = await fetch("/api/inventory-branch", {
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
      console.error("Inventory API error:", error);
      throw error;
    }
  },

  async updateStockAndPrice(
    inventoryId: number,
    quantity: number,
    unitPrice: number,
    lowStockThreshold?: number
  ): Promise<any> {
    try {
      const headers = getUserHeaders();
      const body: any = {
        inventoryId,
        quantity,
        unitPrice,
      };

      if (lowStockThreshold !== undefined) {
        body.lowStockThreshold = lowStockThreshold;
      }

      const response = await fetch("/api/inventory", {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Update stock and price API error:", error);
      throw error;
    }
  },
};
