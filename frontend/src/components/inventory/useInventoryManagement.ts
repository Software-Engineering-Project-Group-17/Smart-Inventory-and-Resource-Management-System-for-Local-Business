import { useState, useEffect } from "react";
import {
  InventoryItem,
  Category,
  Unit,
  InventoryFilters,
  InventoryFormData,
} from "./types";
import { INVENTORY_CONSTANTS } from "./constants";
import { toastUtils } from "@/lib/toast-utils";

// Sample data - in real app this would come from API
const SAMPLE_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    name: "Portland Cement 50kg",
    category: "Cement",
    sku: "CEM001",
    quantity: 125,
    unit: "kg",
    expiryDate: "2025-12-31",
    costPrice: 8.5,
    sellingPrice: 12.99,
  },
  {
    id: 2,
    name: "Steel Nails 3 inch",
    category: "Nails",
    sku: "NAL003",
    quantity: 500,
    unit: "pcs",
    expiryDate: "2026-06-15",
    costPrice: 0.05,
    sellingPrice: 0.08,
  },
  {
    id: 3,
    name: "Copper Wire 14 AWG",
    category: "Wires",
    sku: "WIR014",
    quantity: 75,
    unit: "m",
    expiryDate: "2027-03-20",
    costPrice: 1.25,
    sellingPrice: 2.15,
  },
];

export const useInventoryManagement = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(SAMPLE_INVENTORY);
  const [categories] = useState<Category[]>([
    ...INVENTORY_CONSTANTS.defaults.categories,
  ]);
  const [units] = useState<Unit[]>([...INVENTORY_CONSTANTS.defaults.units]);

  const [filters, setFilters] = useState<InventoryFilters>({
    searchTerm: "",
    selectedCategory: "",
    viewMode: "list",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesCategory =
      !filters.selectedCategory || item.category === filters.selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, searchTerm }));
  };

  // Handle category filter
  const handleCategoryFilter = (category: string) => {
    setFilters((prev) => ({ ...prev, selectedCategory: category }));
  };

  // Handle view mode toggle
  const toggleViewMode = () => {
    setFilters((prev) => ({
      ...prev,
      viewMode: prev.viewMode === "list" ? "grid" : "list",
    }));
  };

  // Modal actions
  const openAddModal = () => {
    setModalMode("add");
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setModalMode("edit");
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openViewModal = (item: InventoryItem) => {
    setModalMode("view");
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // CRUD operations
  const addItem = (itemData: InventoryFormData) => {
    const newItem: InventoryItem = {
      id: Date.now(), // Simple ID generation
      ...itemData,
    };
    setInventory((prev) => [...prev, newItem]);
    closeModal();
  };

  const updateItem = (itemData: InventoryFormData) => {
    if (!editingItem) return;

    setInventory((prev) =>
      prev.map((item) =>
        item.id === editingItem.id ? { ...item, ...itemData } : item
      )
    );
    closeModal();
  };

  const deleteItem = (id: number) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    // Data
    inventory: filteredInventory,
    categories,
    units,
    filters,

    // Modal state
    isModalOpen,
    modalMode,
    editingItem,

    // Actions
    handleSearch,
    handleCategoryFilter,
    toggleViewMode,
    openAddModal,
    openEditModal,
    openViewModal,
    closeModal,
    addItem,
    updateItem,
    deleteItem,
  };
};
