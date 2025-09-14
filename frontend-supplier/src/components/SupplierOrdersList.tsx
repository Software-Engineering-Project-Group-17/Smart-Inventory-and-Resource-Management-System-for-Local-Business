"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";

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
}: SupplierOrdersListProps) {
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
              You haven't created any orders for this request yet.
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
