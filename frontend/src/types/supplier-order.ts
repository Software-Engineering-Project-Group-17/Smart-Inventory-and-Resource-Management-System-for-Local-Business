// Supplier Order Types for Payment Processing
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
  completed_at?: string; // Delivery completion timestamp
  stripe_payment_intent_id?: string;
  payment_method: string;

  // Supplier details
  supplier_name: string;
  supplier_email: string;
  supplier_tel?: string;

  // Items in this order
  items: SupplierOrderItem[];
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

  // Inventory details
  inventory_name: string;
  category_name: string;
}

export interface CreateSupplierOrder {
  restock_request_id: number;
  supplier_id: number;
  estimated_delivery_date?: string;
  supplier_notes?: string;
  items: CreateSupplierOrderItem[];
}

export interface CreateSupplierOrderItem {
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
}

export interface PaymentIntent {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
}

export interface ProcessPaymentRequest {
  supplier_order_id: number;
  payment_method_id: string;
}

export interface PaymentResult {
  success: boolean;
  payment_intent_id?: string;
  error?: string;
}

// Order status configurations
export const SUPPLIER_ORDER_STATUSES = {
  pending: {
    label: "Pending",
    color: "yellow",
    description: "Order is pending approval",
  },
  processing: {
    label: "Processing",
    color: "blue",
    description: "Order is being processed",
  },
  completed: {
    label: "Completed",
    color: "green",
    description: "Order has been completed",
  },
  cancelled: {
    label: "Cancelled",
    color: "red",
    description: "Order was cancelled",
  },
} as const;

export const SUPPLIER_PAYMENT_STATUSES = {
  unpaid: {
    label: "Unpaid",
    color: "red",
    description: "Payment not yet processed",
  },
  paid: {
    label: "Paid",
    color: "green",
    description: "Payment completed successfully",
  },
  cancelled: {
    label: "Cancelled",
    color: "gray",
    description: "Payment was cancelled",
  },
  refunded: {
    label: "Refunded",
    color: "orange",
    description: "Payment was refunded",
  },
} as const;

export const AVAILABILITY_STATUSES = {
  available: {
    label: "Available",
    color: "green",
    description: "Item is in stock",
  },
  limited: {
    label: "Limited",
    color: "yellow",
    description: "Limited quantity available",
  },
  out_of_stock: {
    label: "Out of Stock",
    color: "red",
    description: "Currently out of stock",
  },
  discontinued: {
    label: "Discontinued",
    color: "gray",
    description: "Item is discontinued",
  },
} as const;
