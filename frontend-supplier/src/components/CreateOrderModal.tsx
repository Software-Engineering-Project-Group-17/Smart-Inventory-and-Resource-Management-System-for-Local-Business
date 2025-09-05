"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Package,
  DollarSign,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

interface RequestItem {
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
  category: {
    id: number;
    name: string;
    image_url?: string;
  };
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: number;
  requestTitle: string;
  items: RequestItem[];
  onOrderCreated: () => void;
}

interface OrderItem {
  restock_request_item_id: number;
  inventory_id: number;
  supplier_item_name: string;
  offered_quantity: number;
  unit_price: number;
  supplier_item_description?: string;
  availability_status: string;
  lead_time_days: number;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  requestId,
  requestTitle,
  items,
  onOrderCreated,
}: CreateOrderModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Order details
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [supplierNotes, setSupplierNotes] = useState("");

  // Order items state
  const [orderItems, setOrderItems] = useState<OrderItem[]>(
    items.map((item) => ({
      restock_request_item_id: item.id,
      inventory_id: item.inventory_id,
      supplier_item_name: item.inventory_name,
      offered_quantity: item.requested_quantity,
      unit_price: item.estimated_unit_price,
      supplier_item_description: "",
      availability_status: "available",
      lead_time_days: 0,
    }))
  );

  const updateOrderItem = (
    index: number,
    field: keyof OrderItem,
    value: any
  ) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const calculateTotalAmount = () => {
    return orderItems.reduce((sum, item) => {
      const quantity = isNaN(item.offered_quantity) ? 0 : item.offered_quantity;
      const price = isNaN(item.unit_price) ? 0 : item.unit_price;
      return sum + quantity * price;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create an order");
      return;
    }

    // Validate items
    const invalidItems = orderItems.filter(
      (item) => item.offered_quantity <= 0 || item.unit_price < 0
    );

    if (invalidItems.length > 0) {
      setError(
        "All items must have positive quantities and non-negative prices"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();

      const response = await fetch("/api/supplier/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restock_request_id: requestId,
          estimated_delivery_date: estimatedDeliveryDate || null,
          supplier_notes: supplierNotes || null,
          items: orderItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // Success
      onOrderCreated();
      onClose();

      // Reset form
      setEstimatedDeliveryDate("");
      setSupplierNotes("");
      setOrderItems(
        items.map((item) => ({
          restock_request_item_id: item.id,
          inventory_id: item.inventory_id,
          supplier_item_name: item.inventory_name,
          offered_quantity: item.requested_quantity,
          unit_price: item.estimated_unit_price,
          supplier_item_description: "",
          availability_status: "available",
          lead_time_days: 0,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const totalAmount = calculateTotalAmount();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Create Order for: {requestTitle}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Set your prices and quantities for each requested item. All fields
              are required.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryDate">Estimated Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-right">
                    <Label className="text-lg font-semibold">
                      Total Amount
                    </Label>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Supplier Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this order, delivery instructions, or item specifications..."
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Order Items ({orderItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.map((orderItem, index) => {
                  const originalItem = items[index];
                  return (
                    <div
                      key={orderItem.restock_request_item_id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {originalItem.inventory_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Category: {originalItem.category.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Current Stock: {originalItem.current_stock} | Low
                            Stock Threshold: {originalItem.low_stock_threshold}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          Requested: {originalItem.requested_quantity}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Your Item Name</Label>
                          <Input
                            value={orderItem.supplier_item_name}
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "supplier_item_name",
                                e.target.value
                              )
                            }
                            placeholder="Your product name"
                          />
                        </div>

                        <div>
                          <Label>Offered Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={orderItem.offered_quantity}
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "offered_quantity",
                                e.target.value === ""
                                  ? 0
                                  : parseInt(e.target.value) || 0
                              )
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label>Unit Price ($) *</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={orderItem.unit_price}
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "unit_price",
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value) || 0
                              )
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label>Availability</Label>
                          <Select
                            value={orderItem.availability_status}
                            onValueChange={(value) =>
                              updateOrderItem(
                                index,
                                "availability_status",
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">
                                Available
                              </SelectItem>
                              <SelectItem value="limited">
                                Limited Stock
                              </SelectItem>
                              <SelectItem value="out_of_stock">
                                Out of Stock
                              </SelectItem>
                              <SelectItem value="discontinued">
                                Discontinued
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label>Lead Time (Days)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={orderItem.lead_time_days}
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "lead_time_days",
                                e.target.value === ""
                                  ? 0
                                  : parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Description/Notes</Label>
                          <Input
                            value={orderItem.supplier_item_description || ""}
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "supplier_item_description",
                                e.target.value
                              )
                            }
                            placeholder="Item details, specifications..."
                          />
                        </div>
                      </div>

                      <Separator className="mt-4" />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">
                          {orderItem.offered_quantity || 0} ×{" "}
                          {formatCurrency(orderItem.unit_price || 0)}
                        </span>
                        <span className="font-semibold">
                          ={" "}
                          {formatCurrency(
                            (orderItem.offered_quantity || 0) *
                              (orderItem.unit_price || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || totalAmount <= 0}>
              {loading
                ? "Creating Order..."
                : `Create Order (${formatCurrency(totalAmount)})`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
