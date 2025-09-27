"use client";
import { useState } from "react";

interface InventoryItem {
  inventory_id: number;
  inventory_name: string;
  quantity: number;
  low_stock_threshold: number;
  branch_id: number;
  unit_price?: number;
  stock_status?: "low_stock" | "moderate_stock" | "good_stock";
}

interface MonitoringResult {
  success: boolean;
  branchId: number;
  summary: {
    totalItems: number;
    lowStockItems: number;
    stockUpdatedItems: number;
    notificationsCreated: number;
    duplicatesSkipped: number;
  };
  lowStockItems: InventoryItem[];
  message: string;
}

interface UpdateResult {
  success: boolean;
  inventoryUpdate: {
    inventory_id: number;
    inventory_name: string;
    previous_quantity: number;
    new_quantity: number;
    change_amount: number;
    change_type: string;
    reason: string;
  };
  stockStatus: {
    is_low_stock: boolean;
    was_low_stock: boolean;
    threshold: number;
  };
  notificationsCreated: Array<{
    type: string;
    id: number;
    message: string;
  }>;
  message: string;
}

export const useInventoryMonitoring = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monitorInventory = async (
    branchId: string | number
  ): Promise<MonitoringResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/inventory-monitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ branchId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to monitor inventory");
      }

      const result = await response.json();
      console.log("📊 Inventory monitoring result:", result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to monitor inventory";
      setError(errorMessage);
      console.error("❌ Inventory monitoring error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const checkInventoryStatus = async (
    branchId: string | number
  ): Promise<{
    success: boolean;
    branchId: number;
    summary: {
      totalItems: number;
      lowStock: number;
      moderateStock: number;
      goodStock: number;
    };
    inventoryItems: InventoryItem[];
  } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/inventory-monitor?branchId=${branchId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to check inventory status");
      }

      const result = await response.json();
      console.log("📊 Inventory status check:", result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check inventory status";
      setError(errorMessage);
      console.error("❌ Inventory status check error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateInventoryStock = async (
    inventoryId: number,
    quantityChange: number,
    changeType: "addition" | "reduction",
    reason: string = "",
    userEmail: string
  ): Promise<UpdateResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/inventory-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inventoryId,
          quantityChange,
          changeType,
          reason,
          userEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update inventory");
      }

      const result = await response.json();
      console.log("📦 Inventory update result:", result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update inventory";
      setError(errorMessage);
      console.error("❌ Inventory update error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getInventoryDetails = async (
    inventoryId?: number,
    branchId?: string | number
  ): Promise<{
    success: boolean;
    inventoryItems: InventoryItem | InventoryItem[];
    count: number;
  } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (inventoryId) params.append("inventoryId", inventoryId.toString());
      if (branchId) params.append("branchId", branchId.toString());

      const response = await fetch(
        `/api/inventory-update?${params.toString()}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get inventory details");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get inventory details";
      setError(errorMessage);
      console.error("❌ Get inventory details error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    monitorInventory,
    checkInventoryStatus,
    updateInventoryStock,
    getInventoryDetails,
  };
};
