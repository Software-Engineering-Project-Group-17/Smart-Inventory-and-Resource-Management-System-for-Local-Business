// Restock Request Types
export interface RestockRequest {
  id: number;
  title: string;
  description?: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "pending" | "active" | "completed" | "cancelled";
  required_by_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  notes?: string;
  branch_id: number;
  created_by: number;
  created_by_name?: string;
  branch_name?: string;
  item_count?: number;
  total_quantity_requested?: number;
  items?: RestockRequestItem[];
}

export interface RestockRequestItem {
  inventory_id: number;
  requested_quantity: number;
  estimated_unit_price?: number; // For estimated costs only
  notes?: string;
  // Populated data for display
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
  items: RestockRequestItem[];
}

export interface RestockRequestFilters {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RestockRequestResponse {
  requests: RestockRequest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Constants for display
export const RESTOCK_STATUSES = {
  pending: {
    label: "Pending",
    color: "yellow",
    description: "Request created but not yet published to suppliers",
  },
  active: {
    label: "Active",
    color: "blue",
    description: "Request published and suppliers can respond",
  },
  completed: {
    label: "Completed",
    color: "green",
    description: "All required items have been obtained",
  },
  cancelled: {
    label: "Cancelled",
    color: "red",
    description: "Request was cancelled",
  },
} as const;

export const RESTOCK_PRIORITIES = {
  low: {
    label: "Low",
    color: "gray",
    description: "Non-urgent, can be fulfilled when convenient",
  },
  normal: {
    label: "Normal",
    color: "blue",
    description: "Standard priority request",
  },
  high: {
    label: "High",
    color: "orange",
    description: "Important, should be fulfilled quickly",
  },
  urgent: {
    label: "Urgent",
    color: "red",
    description: "Critical, needs immediate attention",
  },
} as const;

export type RestockStatus = keyof typeof RESTOCK_STATUSES;
export type RestockPriority = keyof typeof RESTOCK_PRIORITIES;
