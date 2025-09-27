// types/restock.ts
export interface InventoryItem {
  inventory_id: number;
  inventory_name: string;
  quantity: number;
  category_id: number;
  low_stock_threshold: number;
  unit_price: number;
  branch_id: number;
  image_url?: string;
  category_name?: string;
}

export interface RestockRequest {
  id: number;
  branch_id: number;
  created_by: number;
  title: string;
  description?: string;
  status: "pending" | "active" | "completed" | "cancelled";
  total_estimated_cost: number;
  priority: "low" | "normal" | "high" | "urgent";
  required_by_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  notes?: string;

  // Joined fields
  branch_name?: string;
  created_by_name?: string;
  item_count?: number;
}

export interface RestockRequestItem {
  id: number;
  restock_request_id: number;
  inventory_id: number;
  requested_quantity: number;
  estimated_unit_price?: number;
  notes?: string;
  created_at: string;

  // Joined fields
  inventory_name?: string;
  current_stock?: number;
  low_stock_threshold?: number;
  category_name?: string;
}

export interface CreateRestockRequest {
  title: string;
  description?: string;
  priority: "low" | "normal" | "high" | "urgent";
  required_by_date?: string;
  notes?: string;
  branch_id: number;
  created_by: number;
  items: Array<{
    inventory_id: number;
    requested_quantity: number;
    estimated_unit_price?: number;
    notes?: string;
  }>;
}
