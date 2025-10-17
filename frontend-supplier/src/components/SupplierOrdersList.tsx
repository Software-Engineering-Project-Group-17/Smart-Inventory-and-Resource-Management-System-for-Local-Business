"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Package } from "lucide-react";
import { toast } from "sonner";

interface SupplierOrder {
  id: number;
  supplier_id: number;
  supplier_name: string;
  supplier_email: string;
  supplier_tel?: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  estimated_delivery_date?: string;
  supplier_notes?: string;
  created_at: string;
  items_count: number;
  total_offered_quantity: number;
}

interface SupplierOrdersListProps {
  orders: SupplierOrder[];
  isAuthenticated: boolean;
  currentSupplierId?: number;
  onOrderUpdate?: () => void; // Callback to refresh the orders list
}

const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function SupplierOrdersList({
  orders,
  isAuthenticated,
  currentSupplierId,
  onOrderUpdate,
}: SupplierOrdersListProps) {
  const [isMarkingShipped, setIsMarkingShipped] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleMarkAsShipped = async (orderId: number) => {
    if (!confirm("Are you sure you want to mark this order as shipped?")) {
      return;
    }

    setIsMarkingShipped(orderId);

    try {
      const response = await fetch(
        `/api/supplier-orders/${orderId}/mark-shipped`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Order marked as shipped successfully");
        if (onOrderUpdate) {
          onOrderUpdate(); // Refresh the orders list
        }
      } else {
        toast.error(data.message || "Failed to mark order as shipped");
      }
    } catch (error) {
      console.error("Error marking order as shipped:", error);
      toast.error("Failed to mark order as shipped");
    } finally {
      setIsMarkingShipped(null);
    }
  };

  const canMarkAsShipped = (order: SupplierOrder) => {
    return (
      order.payment_status === "paid" &&
      order.order_status !== "shipped" &&
      order.order_status !== "delivered" &&
      order.order_status !== "cancelled"
    );
  };

  // If not authenticated, don't show any orders
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Supplier Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">
              Please log in to view supplier orders for this request.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter orders to only show current supplier's orders
  const filteredOrders = currentSupplierId
    ? orders.filter((order) => order.supplier_id === currentSupplierId)
    : [];

  if (filteredOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            My Supplier Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">
              You have not created any orders for this request yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          My Supplier Orders ({filteredOrders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {order.supplier_name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {order.supplier_email}
                  </p>
                  {order.supplier_tel && (
                    <p className="text-sm text-gray-600">
                      {order.supplier_tel}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {formatCurrency(order.total_amount)}
                  </div>
                  <div className="text-sm text-gray-500">Order #{order.id}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge
                  className={
                    ORDER_STATUS_COLORS[
                      order.order_status as keyof typeof ORDER_STATUS_COLORS
                    ]
                  }
                >
                  {order.order_status}
                </Badge>
                <Badge
                  className={
                    PAYMENT_STATUS_COLORS[
                      order.payment_status as keyof typeof PAYMENT_STATUS_COLORS
                    ]
                  }
                >
                  {order.payment_status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Items</div>
                  <div className="font-medium">{order.items_count} items</div>
                </div>
                <div>
                  <div className="text-gray-500">Quantity</div>
                  <div className="font-medium">
                    {order.total_offered_quantity} units
                  </div>
                </div>
                {order.estimated_delivery_date && (
                  <div>
                    <div className="text-gray-500">Est. Delivery</div>
                    <div className="font-medium">
                      {formatDateShort(order.estimated_delivery_date)}
                    </div>
                  </div>
                )}
              </div>

              {order.supplier_notes && (
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div className="font-medium text-gray-700 mb-1">
                    Supplier Notes:
                  </div>
                  <div className="text-gray-600">{order.supplier_notes}</div>
                </div>
              )}

              {canMarkAsShipped(order) && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleMarkAsShipped(order.id)}
                    disabled={isMarkingShipped === order.id}
                    variant="outline"
                    size="sm"
                    className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    {isMarkingShipped === order.id
                      ? "Marking..."
                      : "Mark as Shipped"}
                  </Button>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Created: {formatDate(order.created_at)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
