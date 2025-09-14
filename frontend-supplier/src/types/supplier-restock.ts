// Types for Supplier Restock Management System
// Date: September 5, 2025

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

  // Joined data from views
  branch_name?: string;
  branch_location?: string;
  created_by_name?: string;
  created_by_email?: string;
  total_items_requested?: number;
  total_quantity_requested?: number;
  supplier_orders_count?: number;
  paid_orders_count?: number;
  total_paid_amount?: number;
}

export interface RestockRequestItem {
  id: number;
  restock_request_id: number;
  inventory_id: number;
  requested_quantity: number;
  estimated_unit_price?: number;
  notes?: string;
  created_at: string;

  // Joined inventory data
  inventory_name?: string;
  current_stock?: number;
  unit_price?: number;
  low_stock_threshold?: number;
  category_name?: string;
  image_url?: string;
}

export interface SupplierOrder {
  id: number;
  restock_request_id: number;
  supplier_id: number;
  order_status: "pending" | "processing" | "completed" | "cancelled";
  payment_status: "unpaid" | "paid" | "cancelled" | "refunded";
  total_amount: number;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  supplier_notes?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  cancelled_at?: string;
  stripe_payment_intent_id?: string;
  payment_method: string;

  // Joined data
  supplier_name?: string;
  supplier_email?: string;
  supplier_tel?: string;
  items_count?: number;
  total_quantity_offered?: number;
}

export interface SupplierOrderItem {
  id: number;
  supplier_order_id: number;
  restock_request_item_id: number;
  inventory_id: number;
  supplier_item_name?: string;
  offered_quantity: number;
  unit_price: number;
  total_price: number;
  supplier_item_description?: string;
  availability_status:
    | "available"
    | "limited"
    | "out_of_stock"
    | "discontinued";
  lead_time_days: number;

  // Joined data
  inventory_name?: string;
  requested_quantity?: number;
  category_name?: string;
}

export interface SupplierItem {
  id: number;
  supplier_id: number;
  inventory_id?: number;
  supplier_item_name: string;
  category_id?: number;
  base_unit_price?: number;
  minimum_order_quantity: number;
  maximum_order_quantity?: number;
  lead_time_days: number;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;

  // Joined data
  inventory_name?: string;
  category_name?: string;
}

// API Response types
export interface RestockRequestsResponse {
  requests: RestockRequest[];
  total_count: number;
  page: number;
  limit: number;
}

export interface RestockRequestDetailResponse {
  request: RestockRequest;
  items: RestockRequestItem[];
  supplier_orders: SupplierOrder[];
}

export interface CreateSupplierOrderRequest {
  restock_request_id: number;
  supplier_id: number;
  estimated_delivery_date?: string;
  supplier_notes?: string;
  items: {
    restock_request_item_id: number;
    inventory_id: number;
    supplier_item_name?: string;
    offered_quantity: number;
    unit_price: number;
    supplier_item_description?: string;
    availability_status?:
      | "available"
      | "limited"
      | "out_of_stock"
      | "discontinued";
    lead_time_days?: number;
  }[];
}

export interface CreateSupplierOrderResponse {
  supplier_order: SupplierOrder;
  order_items: SupplierOrderItem[];
  total_amount: number;
}

// Filter and pagination types
export interface RestockRequestFilters {
  status?: string;
  priority?: string;
  branch_id?: number;
  created_by?: number;
  required_by_date_from?: string;
  required_by_date_to?: string;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Utility types
export type RestockRequestStatus =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";
export type RestockRequestPriority = "low" | "normal" | "high" | "urgent";
export type SupplierOrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled";
export type SupplierPaymentStatus =
  | "unpaid"
  | "paid"
  | "cancelled"
  | "refunded";
export type ItemAvailabilityStatus =
  | "available"
  | "limited"
  | "out_of_stock"
  | "discontinued";
