import { useState, useEffect } from "react";
import {
  inventoryApi,
  InventoryItem,
  Category,
  Branch,
} from "@/lib/api/inventory";

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  categoriesCount: number;
}

export const useInventoryData = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await inventoryApi.getAll();
      setInventory(data.inventory);
      setCategories(data.categories);
      setBranch(data.branch);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
      console.error("Error loading inventory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Filter inventory based on current filters
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || item.categoryName === selectedCategory;
    const matchesLowStock =
      !showLowStockOnly || item.currentStock <= item.reorderLevel;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Calculate stats
  const stats: InventoryStats = {
    totalItems: inventory.length,
    totalValue: inventory.reduce(
      (sum, item) => sum + item.currentStock * item.unitPrice,
      0
    ),
    lowStockCount: inventory.filter(
      (item) => item.currentStock <= item.reorderLevel
    ).length,
    categoriesCount: categories.length,
  };

  // Low stock items
  const lowStockItems = inventory.filter(
    (item) => item.currentStock <= item.reorderLevel
  );

  const refreshInventory = () => {
    loadInventory();
  };

  return {
    // Data
    inventory: filteredInventory,
    categories,
    branch,
    stats,
    lowStockItems,

    // State
    isLoading,
    error,
    searchTerm,
    selectedCategory,
    showLowStockOnly,

    // Actions
    setSearchTerm,
    setSelectedCategory,
    setShowLowStockOnly,
    refreshInventory,
  };
};
