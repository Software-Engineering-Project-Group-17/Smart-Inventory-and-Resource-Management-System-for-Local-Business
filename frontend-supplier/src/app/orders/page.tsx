"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Package,
  AlertCircle,
  CheckCircle,
  Truck,
  DollarSign,
  MapPin,
  Filter,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

interface Order {
  id: number;
  restock_request_id: number;
  order_status: string;
  payment_status: string;
  total_amount: number;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  supplier_notes?: string;
  created_at: string;
  updated_at: string;
  request_title: string;
  request_status: string;
  request_priority: string;
  required_by_date: string;
  branch_id: number;
  branch_name: string;
  branch_location: string;
  branch_contact?: string;
  items_count: number;
  total_quantity_offered: number;
}

interface Branch {
  id: number;
  name: string;
  location: string;
  contact_number?: string;
  description?: string;
  total_requests: number;
  supplier_orders_count: number;
  paid_orders_count: number;
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    branch_id: number | null;
    supplier_id: number;
  };
}

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
};

const PAYMENT_STATUS_COLORS = {
  unpaid: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: AlertCircle,
  completed: CheckCircle,
};

export default function OrdersPage() {
  const { user, supplier, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrdersResponse | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      if (!user || !supplier) return;

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/supplier/branches", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBranches(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };

    fetchBranches();
  }, [user, supplier]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !supplier) return;

      try {
        setLoading(true);
        const token = await user.getIdToken();

        // Build URL with branch filter
        const url = new URL("/api/supplier/orders", window.location.origin);
        if (selectedBranch && selectedBranch !== "all") {
          url.searchParams.set("branch_id", selectedBranch);
        }

        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    if (user && supplier) {
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, supplier, authLoading, selectedBranch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              You need to be logged in to view your orders.
            </p>
            <Button
              onClick={() => (window.location.href = "/auth/login")}
              className="w-full"
            >
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Error Loading Orders
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">
                Track and manage your orders with retail branches
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {orders?.pagination.total || 0} Total Orders
              </Badge>
            </div>
          </div>

          {/* Branch Filter */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filter by Branch:
              </span>
            </div>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {branch.name} - {branch.location}
                      <Badge variant="outline" className="ml-2">
                        {branch.supplier_orders_count}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {orders?.data.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Orders Yet
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedBranch === "all"
                  ? "You haven't created any orders yet. Start by responding to restock requests."
                  : "No orders found for the selected branch. Try selecting a different branch or create new orders."}
              </p>
              <Button onClick={() => (window.location.href = "/")}>
                View Restock Requests
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders?.data.map((order: Order) => {
              const StatusIcon =
                STATUS_ICONS[order.order_status as keyof typeof STATUS_ICONS] ||
                Package;

              return (
                <Card
                  key={order.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Order #{order.id}
                      </CardTitle>
                      <Badge
                        className={
                          STATUS_COLORS[
                            order.order_status as keyof typeof STATUS_COLORS
                          ] || STATUS_COLORS.pending
                        }
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {order.order_status.charAt(0).toUpperCase() +
                          order.order_status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      {order.branch_name} - {order.branch_location}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {order.request_title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Items: {order.items_count} | Quantity:{" "}
                        {order.total_quantity_offered} units
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {order.request_priority}
                        </Badge>
                        <Badge
                          className={
                            PAYMENT_STATUS_COLORS[
                              order.payment_status as keyof typeof PAYMENT_STATUS_COLORS
                            ] || PAYMENT_STATUS_COLORS.unpaid
                          }
                        >
                          {order.payment_status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>{formatCurrency(order.total_amount)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>

                    {order.estimated_delivery_date && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Truck className="h-4 w-4 mr-1" />
                        <span>
                          Expected: {formatDate(order.estimated_delivery_date)}
                        </span>
                      </div>
                    )}

                    {order.actual_delivery_date && (
                      <div className="flex items-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>
                          Delivered: {formatDate(order.actual_delivery_date)}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Navigate to order details or restock request
                          window.location.href = `/supplier/requests/${order.restock_request_id}`;
                        }}
                      >
                        View Request Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
