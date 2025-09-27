"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

interface RequestDetailsProps {
  description: string;
  notes?: string;
  statistics: {
    total_items: number;
    total_quantity_requested: number;
    supplier_orders_count: number;
  };
  isAuthenticated: boolean;
  currentSupplierOrdersCount?: number;
}

export default function RequestDetails({
  description,
  notes,
  statistics,
  isAuthenticated,
  currentSupplierOrdersCount,
}: RequestDetailsProps) {
  const ordersCount =
    isAuthenticated && currentSupplierOrdersCount !== undefined
      ? currentSupplierOrdersCount
      : statistics.supplier_orders_count;

  const ordersLabel = isAuthenticated ? "My Orders" : "Total Orders";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Request Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600">{description}</p>
        </div>

        {notes && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.total_items}
            </div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {statistics.total_quantity_requested}
            </div>
            <div className="text-sm text-gray-600">Total Quantity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {ordersCount}
            </div>
            <div className="text-sm text-gray-600">{ordersLabel}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
