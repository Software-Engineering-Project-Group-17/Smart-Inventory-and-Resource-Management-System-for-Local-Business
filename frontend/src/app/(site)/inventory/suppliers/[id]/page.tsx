"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Store,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Eye,
  Download,
  Filter,
  Search,
  Loader2,
} from "lucide-react";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { toastUtils } from "@/lib/toast-utils";

interface Supplier {
  id: number;
  supplier_name: string;
  supplier_email: string;
  supplier_tel: string;
  address: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface SupplierOrder {
  id: number;
  order_status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  supplier_notes?: string;
  paid_at?: string;
  request_id: number;
  request_title: string;
  priority: string;
  branch_name: string;
  branch_location: string;
  branch_id: number;
  items_count: number;
}

interface Statistics {
  totalOrders: number;
  paidOrders: number;
  totalPaidAmount: number;
  pendingOrders: number;
}

interface BranchStats {
  totalOrders: number;
  paidOrders: number;
  totalPaidAmount: number;
  pendingOrders: number;
}

interface SupplierData {
  supplier: Supplier;
  orders: SupplierOrder[];
  statistics: Statistics;
  branchStats?: BranchStats;
}

export default function SupplierDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params.id as string;

  const [data, setData] = useState<SupplierData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState<SupplierOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  useEffect(() => {
    if (supplierId) {
      loadSupplierData();
    }
  }, [supplierId]);

  useEffect(() => {
    if (data) {
      filterOrders();
    }
  }, [data, searchTerm, statusFilter, paymentFilter]);

  const loadSupplierData = async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch(
        `/api/suppliers?id=${supplierId}`
      );

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        toastUtils.dataLoaded("Supplier details", 1);
      } else {
        if (response.status === 404) {
          toastUtils.error(
            "Supplier Not Found",
            "The requested supplier could not be found"
          );
          router.push("/inventory/suppliers");
        } else {
          toastUtils.dataError(
            "loading supplier details",
            "Failed to load supplier information"
          );
        }
      }
    } catch (error) {
      console.error("Error loading supplier data:", error);
      toastUtils.networkError();
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    if (!data) return;

    let filtered = [...data.orders];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (order) =>
          order.request_title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.supplier_notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.order_status === statusFilter
      );
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.payment_status === paymentFilter
      );
    }

    setFilteredOrders(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string, type: "order" | "payment") => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    if (type === "order") {
      switch (status) {
        case "pending":
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case "processing":
          return `${baseClasses} bg-blue-100 text-blue-800`;
        case "completed":
          return `${baseClasses} bg-green-100 text-green-800`;
        case "cancelled":
          return `${baseClasses} bg-red-100 text-red-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    } else {
      switch (status) {
        case "paid":
          return `${baseClasses} bg-green-100 text-green-800`;
        case "unpaid":
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case "cancelled":
          return `${baseClasses} bg-red-100 text-red-800`;
        case "refunded":
          return `${baseClasses} bg-purple-100 text-purple-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (priority) {
      case "urgent":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "high":
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case "normal":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "low":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#3674B5]" />
          <span className="text-lg text-gray-600">
            Loading supplier details...
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Supplier Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested supplier could not be found.
          </p>
          <button
            onClick={() => router.push("/inventory/suppliers")}
            className="px-4 py-2 bg-[#3674B5] hover:bg-blue-900 text-white rounded-md transition-colors"
          >
            Back to Suppliers
          </button>
        </div>
      </div>
    );
  }

  const { supplier, orders, statistics, branchStats } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push("/inventory/suppliers")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Suppliers</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Store size={32} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {supplier.supplier_name}
              </h1>
              <p className="text-gray-600">
                Supplier Information & Order History
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Information Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Supplier Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{supplier.supplier_email}</p>
                </div>
              </div>

              {supplier.supplier_tel && (
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-gray-900">{supplier.supplier_tel}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {supplier.address && (
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="text-gray-900">{supplier.address}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Registered
                  </p>
                  <p className="text-gray-900">
                    {formatDate(supplier.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-gray-900">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.paidOrders}
                </p>
                {branchStats && (
                  <p className="text-xs text-gray-500">
                    ({branchStats.paidOrders} from current branch)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(statistics.totalPaidAmount)}
                </p>
                {branchStats && (
                  <p className="text-xs text-gray-500">
                    ({formatCurrency(branchStats.totalPaidAmount)} from branch)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.pendingOrders}
                </p>
                {branchStats && (
                  <p className="text-xs text-gray-500">
                    ({branchStats.pendingOrders} from current branch)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Order History ({filteredOrders.length})
              </h2>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5]"
              >
                <option value="all">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPaymentFilter("all");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">
                {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                  ? "No orders found matching your filters"
                  : "No orders found for this supplier"}
              </p>
              {(searchTerm ||
                statusFilter !== "all" ||
                paymentFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setPaymentFilter("all");
                  }}
                  className="text-[#3674B5] hover:text-blue-900 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.request_title}
                        </h3>
                        <span className={getPriorityBadge(order.priority)}>
                          {order.priority.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Order #
                          </p>
                          <p className="text-gray-900">#{order.id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Branch
                          </p>
                          <p className="text-gray-900">{order.branch_name}</p>
                          <p className="text-xs text-gray-500">
                            {order.branch_location}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Amount
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {formatCurrency(order.total_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Items
                          </p>
                          <p className="text-gray-900">
                            {order.items_count} items
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Created
                          </p>
                          <p className="text-gray-900">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        {order.estimated_delivery_date && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Est. Delivery
                            </p>
                            <p className="text-gray-900">
                              {formatDate(order.estimated_delivery_date)}
                            </p>
                          </div>
                        )}
                        {order.actual_delivery_date && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Delivered
                            </p>
                            <p className="text-gray-900">
                              {formatDate(order.actual_delivery_date)}
                            </p>
                          </div>
                        )}
                        {order.paid_at && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Paid
                            </p>
                            <p className="text-gray-900">
                              {formatDateTime(order.paid_at)}
                            </p>
                          </div>
                        )}
                      </div>

                      {order.supplier_notes && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Supplier Notes
                          </p>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                            {order.supplier_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-6">
                      <div className="flex gap-2">
                        <span
                          className={getStatusBadge(
                            order.order_status,
                            "order"
                          )}
                        >
                          {order.order_status.toUpperCase()}
                        </span>
                        <span
                          className={getStatusBadge(
                            order.payment_status,
                            "payment"
                          )}
                        >
                          {order.payment_status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
