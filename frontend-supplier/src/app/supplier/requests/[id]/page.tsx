"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Package,
  MapPin,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Truck,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

interface RequestDetailData {
  success: boolean;
  data: {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    total_estimated_cost: number;
    required_by_date: string;
    created_at: string;
    updated_at: string;
    notes?: string;

    branch: {
      id: number;
      name: string;
      location: string;
      contact_number?: string;
      description?: string;
    };

    created_by: {
      id: number;
      name: string;
      email: string;
    };

    items: Array<{
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
    }>;

    supplier_orders: Array<{
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
    }>;

    statistics: {
      total_items: number;
      total_quantity_requested: number;
      total_estimated_value: number;
      supplier_orders_count: number;
    };
  };
}

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const STATUS_COLORS = {
  pending: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

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

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, supplier } = useAuth();
  const [requestData, setRequestData] = useState<RequestDetailData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequestDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/supplier/restock-requests/${params.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch request details");
        }

        const data = await response.json();
        setRequestData(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch request details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRequestDetail();
    }
  }, [params.id]);

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

  const isUrgent = (requiredByDate: string, priority: string) => {
    const required = new Date(requiredByDate);
    const today = new Date();
    const daysLeft = Math.ceil(
      (required.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return priority === "urgent" || daysLeft <= 3;
  };

  const getDaysLeft = (requiredByDate: string) => {
    const required = new Date(requiredByDate);
    const today = new Date();
    return Math.ceil(
      (required.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const handleCreateOrder = () => {
    if (!user || !supplier) {
      // Redirect to login if not authenticated
      router.push(
        "/auth/login?redirect=" + encodeURIComponent(window.location.pathname)
      );
    } else {
      // TODO: Navigate to create order page or open modal
      console.log("Create order for request:", params.id);
      alert("Create order functionality will be implemented here!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !requestData?.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error || "Failed to load request details"}</span>
              </div>
              <Button className="mt-4" onClick={() => router.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const request = requestData.data;
  const daysLeft = getDaysLeft(request.required_by_date);
  const isRequestUrgent = isUrgent(request.required_by_date, request.priority);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {request.title}
              </h1>
              <p className="text-gray-600 mt-1">
                Restock Request #{request.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={
                  STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]
                }
              >
                {request.status}
              </Badge>
              <Badge
                className={
                  PRIORITY_COLORS[
                    request.priority as keyof typeof PRIORITY_COLORS
                  ]
                }
              >
                {request.priority}
              </Badge>
              {isRequestUrgent && (
                <Badge className="bg-red-100 text-red-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {daysLeft <= 0 ? "Overdue" : `${daysLeft} days left`}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600">{request.description}</p>
                </div>

                {request.notes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Additional Notes
                    </h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {request.notes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {request.statistics.total_items}
                    </div>
                    <div className="text-sm text-gray-600">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {request.statistics.total_quantity_requested}
                    </div>
                    <div className="text-sm text-gray-600">Total Quantity</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {request.statistics.supplier_orders_count}
                    </div>
                    <div className="text-sm text-gray-600">Supplier Orders</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requested Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Requested Items ({request.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.items.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
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
                          Low stock alert (threshold: {item.low_stock_threshold}
                          )
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Supplier Orders */}
            {request.supplier_orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Supplier Orders ({request.supplier_orders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {request.supplier_orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
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
                            <div className="text-sm text-gray-500">
                              Order #{order.id}
                            </div>
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
                            <div className="font-medium">
                              {order.items_count} items
                            </div>
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
                            <div className="text-gray-600">
                              {order.supplier_notes}
                            </div>
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
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-gray-500">Required by</div>
                    <div className="font-medium">
                      {formatDateShort(request.required_by_date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-gray-500">Created</div>
                    <div className="font-medium">
                      {formatDate(request.created_at)}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    Time Remaining
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      daysLeft <= 3
                        ? "text-red-600"
                        : daysLeft <= 7
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {daysLeft <= 0 ? "Overdue" : `${daysLeft} days`}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Branch Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Branch Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{request.branch.name}</div>
                    <div className="text-gray-500">
                      {request.branch.location}
                    </div>
                  </div>
                </div>

                {request.branch.contact_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div className="text-gray-600">
                      {request.branch.contact_number}
                    </div>
                  </div>
                )}

                {request.branch.description && (
                  <div className="text-sm text-gray-600 mt-2">
                    {request.branch.description}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Created By */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requested By</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <div className="font-medium">{request.created_by.name}</div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div className="text-gray-600">
                    {request.created_by.email}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button className="w-full">Create Supplier Order</Button>
                <Button variant="outline" className="w-full">
                  Download Request
                </Button>
                <Button variant="outline" className="w-full">
                  Contact Branch
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
