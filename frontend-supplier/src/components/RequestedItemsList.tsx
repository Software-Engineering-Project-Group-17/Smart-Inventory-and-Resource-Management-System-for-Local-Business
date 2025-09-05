"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, AlertCircle } from "lucide-react";

interface RequestedItem {
  id: number;
  inventory_id: number;
  inventory_name: string;
  requested_quantity: number;
  estimated_unit_price: number;
  current_stock: number;
  low_stock_threshold: number;
  current_unit_price: number;
  image_url?: string;
  notes?: string;
  created_at: string;
  category: {
    id: number;
    name: string;
    image_url?: string;
  };
}

interface RequestedItemsListProps {
  items: RequestedItem[];
}

export default function RequestedItemsList({ items }: RequestedItemsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Requested Items ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {item.inventory_name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Category: {item.category.name}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Requested</div>
                  <div className="font-medium">
                    {item.requested_quantity} units
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Current Stock</div>
                  <div
                    className={`font-medium ${
                      item.current_stock <= item.low_stock_threshold
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {item.current_stock} units
                  </div>
                </div>
              </div>

              {item.current_stock <= item.low_stock_threshold && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Low stock alert (threshold: {item.low_stock_threshold})
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
