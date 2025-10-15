"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

// Custom color scheme based on #3674B5
const COLORS = {
  primary: "#3674B5",
  primaryHover: "#2A5D96",
  primaryLight: "#E8F1FC",
  primaryDark: "#1E4A7A",
  secondary: "#4A90E2",
  accent: "#5BA3F5",
  background: "#F8FBFF",
};

// Types
interface OrderItem {
  id: number;
  inventory_id: number;
  inventory_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category_name: string;
}

interface Order {
  id: number;
  customer_id: number;
  order_status: "pending" | "processing" | "completed" | "cancelled";
  payment_status: "paid" | "unpaid" | "refunded" | "failed";
  total_amount: number;
  created_at: string;
  updated_at: string;
  shipping_address: string;
  stripe_payment_intent_id: string;
  notes: string;
  customer_name: string;
  customer_email: string;
  customer_tel: string;
  customer_address: string;
  item_count: number;
  total_quantity: number;
  items: OrderItem[];
}

interface OrdersResponse {
  success: boolean;
  data?: {
    orders: Order[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_orders: number;
      limit: number;
      has_next: boolean;
      has_prev: boolean;
    };
    branch: {
      id: number;
      name: string;
      location: string;
    };
    statistics: {
      total_orders: number;
      pending_orders: number;
      processing_orders: number;
      completed_orders: number;
      cancelled_orders: number;
      paid_orders: number;
      unpaid_orders: number;
      total_revenue: number;
      average_order_value: number;
    };
    filters: {
      status?: string;
      payment_status?: string;
      start_date?: string;
      end_date?: string;
      customer_id?: string;
    };
  };
  error?: string;
}

// Status badge component
const StatusBadge: React.FC<{ status: string; type: "order" | "payment" }> = ({
  status,
  type,
}) => {
  // Handle null/undefined status
  const safeStatus = status || "unknown";

  const getOrderStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return `bg-blue-100 text-blue-800 border-blue-200`;
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusStyles = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIcon = () => {
    if (type === "order") {
      switch (safeStatus) {
        case "pending":
          return <Clock className="h-3 w-3" />;
        case "processing":
          return <AlertCircle className="h-3 w-3" />;
        case "completed":
          return <CheckCircle className="h-3 w-3" />;
        case "cancelled":
          return <XCircle className="h-3 w-3" />;
        default:
          return null;
      }
    } else {
      switch (safeStatus) {
        case "paid":
          return <CheckCircle className="h-3 w-3" />;
        case "unpaid":
          return <Clock className="h-3 w-3" />;
        case "refunded":
          return <AlertCircle className="h-3 w-3" />;
        case "failed":
          return <XCircle className="h-3 w-3" />;
        default:
          return null;
      }
    }
  };

  const styles =
    type === "order"
      ? getOrderStatusStyles(safeStatus)
      : getPaymentStatusStyles(safeStatus);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles}`}
    >
      {getIcon()}
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
};

// Statistics card component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  style?: React.CSSProperties;
}> = ({ title, value, icon, color, style }) => (
  <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
          {title}
        </p>
        <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
          {value}
        </p>
      </div>
      <div
        className={`p-2 sm:p-3 rounded-full ${color} flex-shrink-0 ml-2`}
        style={style}
      >
        {icon}
      </div>
    </div>
  </div>
);

// Order detail modal component
const OrderDetailModal: React.FC<{ order: Order; onClose: () => void }> = ({
  order,
  onClose,
}) => {
  // Calculate totals and discount from actual database data
  const itemsSubtotal =
    order.items?.reduce(
      (sum, item) => sum + Number(item.total_price || 0),
      0
    ) || 0;

  const orderTotal = Number(order.total_amount || 0);
  const discountAmount = itemsSubtotal - orderTotal;
  const hasDiscount = discountAmount > 0.01; // Account for floating point precision

  return (
    <div className="fixed inset-0 backdrop-blur flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Order #{order.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Order Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Order Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <StatusBadge status={order.order_status} type="order" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <StatusBadge status={order.payment_status} type="payment" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Subtotal:</span>
                    <span className="font-medium">
                      ${itemsSubtotal.toFixed(2)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">
                        -${discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 font-semibold">
                      Final Total:
                    </span>
                    <span className="font-bold text-lg">
                      ${orderTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span>
                      {new Date(order.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong> {order.customer_name || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {order.customer_email || "N/A"}
                  </p>
                  {order.customer_tel && (
                    <p>
                      <strong>Phone:</strong> {order.customer_tel}
                    </p>
                  )}
                  {order.customer_address && (
                    <p>
                      <strong>Address:</strong> {order.customer_address}
                    </p>
                  )}
                </div>
              </div>

              {order.shipping_address && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </h3>
                  <p className="text-gray-700">{order.shipping_address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-3 text-left">Item</th>
                    <th className="border p-3 text-left">Category</th>
                    <th className="border p-3 text-right">Quantity</th>
                    <th className="border p-3 text-right">Unit Price</th>
                    <th className="border p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border p-3">{item.inventory_name}</td>
                      <td className="border p-3">{item.category_name}</td>
                      <td className="border p-3 text-right">{item.quantity}</td>
                      <td className="border p-3 text-right">
                        ${Number(item.unit_price || 0).toFixed(2)}
                      </td>
                      <td className="border p-3 text-right font-semibold">
                        ${Number(item.total_price || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td
                      colSpan={4}
                      className="border p-3 text-right font-medium"
                    >
                      Items Subtotal:
                    </td>
                    <td className="border p-3 text-right font-medium">
                      ${itemsSubtotal.toFixed(2)}
                    </td>
                  </tr>
                  {hasDiscount && (
                    <tr className="bg-green-50">
                      <td
                        colSpan={4}
                        className="border p-3 text-right font-medium text-green-700"
                      >
                        Staff Discount:
                      </td>
                      <td className="border p-3 text-right font-medium text-green-700">
                        -${discountAmount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={4} className="border p-3 text-right">
                      Final Total:
                    </td>
                    <td className="border p-3 text-right">
                      ${orderTotal.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Info */}
          {order.stripe_payment_intent_id && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </h3>
              <p>
                <strong>Stripe Payment Intent:</strong>{" "}
                {order.stripe_payment_intent_id}
              </p>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (statusFilter) params.append("status", statusFilter);
      if (paymentStatusFilter)
        params.append("payment_status", paymentStatusFilter);
      if (dateFilter.start) params.append("start_date", dateFilter.start);
      if (dateFilter.end) params.append("end_date", dateFilter.end);

      const response = await authenticatedFetch(`/api/orders?${params}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: OrdersResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.success
            ? "Unknown error"
            : data.error || "Failed to fetch orders"
        );
      }

      if (data.success && data.data) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
        setStatistics(data.data.statistics);
        setBranch(data.data.branch);
      } else {
        throw new Error(data.error || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, paymentStatusFilter, dateFilter]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement client-side search or trigger API call
  };

  const handleDateFilterChange = (start: string, end: string) => {
    setDateFilter({ start, end });
    setCurrentPage(1); // Reset to first page
  };

  const handleStatusFilterChange = (
    status: string,
    type: "order" | "payment"
  ) => {
    if (type === "order") {
      setStatusFilter(status);
    } else {
      setPaymentStatusFilter(status);
    }
    setCurrentPage(1); // Reset to first page
  };

  const exportToCSV = () => {
    const csvContent = orders.map((order) => ({
      "Order ID": order.id,
      Customer: order.customer_name,
      Email: order.customer_email,
      Status: order.order_status,
      "Payment Status": order.payment_status,
      "Total Amount": order.total_amount,
      Items: order.item_count,
      "Created Date": new Date(order.created_at).toLocaleDateString(),
    }));

    const headers = Object.keys(csvContent[0] || {});
    const csvString = [
      headers.join(","),
      ...csvContent.map((row) =>
        headers
          .map((header) => `"${row[header as keyof typeof row]}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredOrders = orders.filter(
    (order) =>
      (order.customer_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (order.customer_email?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      order.id.toString().includes(searchTerm)
  );

  if (loading && !orders.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="h-8 w-8 animate-spin mx-auto mb-4"
            style={{ color: COLORS.primary }}
          />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: COLORS.background }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingCart
                  className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3"
                  style={{ color: COLORS.primary }}
                />
                Orders Management
              </h1>
              {branch && (
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {branch.name} - {branch.location}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base"
                style={{ backgroundColor: COLORS.primary }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.currentTarget.style.backgroundColor = COLORS.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.primary;
                }}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
            <StatCard
              title="Total Orders"
              value={statistics.total_orders}
              icon={
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              }
              color="bg-opacity-100"
              style={{ backgroundColor: COLORS.primary }}
            />
            <StatCard
              title="Total Revenue"
              value={`$${Number(statistics.total_revenue).toFixed(2)}`}
              icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
              color="bg-green-500"
            />
            <StatCard
              title="Avg Order Value"
              value={`$${Number(statistics.average_order_value).toFixed(2)}`}
              icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
              color="bg-purple-500"
            />
            <StatCard
              title="Pending Orders"
              value={statistics.pending_orders}
              icon={<Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
              color="bg-yellow-500"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-3 py-2 border rounded-lg w-full focus:ring-2 focus:border-opacity-50 outline-none text-sm sm:text-base"
                style={
                  {
                    "--tw-ring-color": COLORS.primary,
                    borderColor: searchTerm ? COLORS.primary : undefined,
                  } as React.CSSProperties
                }
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary}33`;
                }}
                onBlur={(e) => {
                  if (!searchTerm) {
                    e.currentTarget.style.borderColor = "";
                    e.currentTarget.style.boxShadow = "";
                  }
                }}
              />
            </div>

            {/* Order Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusFilterChange(e.target.value, "order")
              }
              className="px-3 py-2 border rounded-lg outline-none text-sm sm:text-base"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary}33`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentStatusFilter}
              onChange={(e) =>
                handleStatusFilterChange(e.target.value, "payment")
              }
              className="px-3 py-2 border rounded-lg outline-none text-sm sm:text-base"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary}33`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <option value="">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>

            {/* Date Range */}
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) =>
                handleDateFilterChange(e.target.value, dateFilter.end)
              }
              className="px-3 py-2 border rounded-lg outline-none text-sm sm:text-base"
              placeholder="Start date"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary}33`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            />
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) =>
                handleDateFilterChange(dateFilter.start, e.target.value)
              }
              className="px-3 py-2 border rounded-lg outline-none text-sm sm:text-base"
              placeholder="End date"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary}33`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    // Calculate if order has discount for quick indicator
                    const itemsSubtotal =
                      order.items?.reduce(
                        (sum, item) => sum + Number(item.total_price || 0),
                        0
                      ) || 0;
                    const orderTotal = Number(order.total_amount || 0);
                    const hasDiscount = itemsSubtotal - orderTotal > 0.01;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            #{order.id}
                            {hasDiscount && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Discounted
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.customer_name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer_email || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={order.order_status}
                            type="order"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={order.payment_status}
                            type="payment"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.item_count || 0} items (
                          {order.total_quantity || 0} qty)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div>
                            ${orderTotal.toFixed(2)}
                            {hasDiscount && (
                              <div className="text-xs text-green-600">
                                (was ${itemsSubtotal.toFixed(2)})
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center gap-1 hover:opacity-75 transition-opacity"
                            style={{ color: COLORS.primary }}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.has_prev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.has_next}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * pagination.limit,
                      pagination.total_orders
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{pagination.total_orders}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.has_prev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {currentPage} of {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.has_next}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
