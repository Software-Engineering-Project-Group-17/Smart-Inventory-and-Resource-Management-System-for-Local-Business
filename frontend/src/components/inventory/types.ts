export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  costPrice: number;
  sellingPrice: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Unit {
  id: number;
  name: string;
}

export interface InventoryFormData {
  name: string;
  category: string;
  sku: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  costPrice: number;
  sellingPrice: number;
}

export interface InventoryFilters {
  searchTerm: string;
  selectedCategory: string;
  viewMode: "list" | "grid";
}

export type InventoryAction = "add" | "edit" | "view" | "delete";
