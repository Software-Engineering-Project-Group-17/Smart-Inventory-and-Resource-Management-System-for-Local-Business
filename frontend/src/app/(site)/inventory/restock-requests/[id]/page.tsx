"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { withAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/lib/auth";
import { RestockRequest } from "@/types/restock";
import { SupplierOrder } from "@/types/supplier-order";
import { SupplierOrderCard } from "@/components/restock-requests/SupplierOrderCard";
import { PaymentModal } from "@/components/restock-requests/PaymentModal";
import { toastUtils } from "@/lib/toast-utils";

const RestockRequestDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<RestockRequest | null>(null);
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(
    null
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState<number | null>(null);

  const loadRequestDetails = async () => {
    try {
      setIsLoading(true);
      const userProfile = getUserProfile();

      const headers: HeadersInit = {};
      if (userProfile) {
        headers["x-user-id"] = userProfile.id;
        headers["x-user-email"] = userProfile.email;
      }

      // Load restock request details
      const requestResponse = await fetch(
        `/api/restock-requests/${requestId}`,
        {
          headers,
        }
      );

      if (requestResponse.ok) {
        const requestData = await requestResponse.json();
        setRequest(requestData.request);
      } else {
        setError("Failed to load restock request details");
        return;
      }

      // Load supplier orders
      const ordersResponse = await fetch(
        `/api/restock-requests/${requestId}/supplier-orders`,
        {
          headers,
        }
      );

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setSupplierOrders(ordersData.orders);
      } else {
        setError("Failed to load supplier orders");
      }
    } catch (err) {
      setError("Failed to load request details");
      console.error("Error loading request details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      loadRequestDetails();
    }
  }, [requestId]);

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedOrder(null);
    loadRequestDetails(); // Refresh the data
  };

  const handleSelectOrder = (order: SupplierOrder) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  const handleCancelOrder = async (order: SupplierOrder) => {
    if (
      !confirm(
        `Are you sure you want to cancel the order from ${order.supplier_name}?`
      )
    ) {
      return;
    }

    try {
      setIsCancelling(order.id);
      const userProfile = getUserProfile();

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (userProfile) {
        headers["x-user-id"] = userProfile.id;
        headers["x-user-email"] = userProfile.email;
      }

      const response = await fetch(`/api/supplier-orders/${order.id}/cancel`, {
        method: "PATCH",
        headers,
      });

      if (response.ok) {
        // Refresh the data to show updated status
        loadRequestDetails();
      } else {
        const errorData = await response.json();
        toastUtils.error(
          "Cancel Failed",
          `Failed to cancel order: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      toastUtils.error(
        "Cancel Failed",
        "Failed to cancel order. Please try again."
      );
    } finally {
      setIsCancelling(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Request
            </h3>
            <p className="text-gray-600 mb-4">{error || "Request not found"}</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalOrders = supplierOrders.length;
  const paidOrders = supplierOrders.filter(
    (order) => order.payment_status === "paid"
  ).length;
  const totalValue = supplierOrders.reduce(
    (sum, order) => sum + Number(order.total_amount),
    0
  );
  const paidValue = supplierOrders
    .filter((order) => order.payment_status === "paid")
    .reduce((sum, order) => sum + Number(order.total_amount), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Restock Requests
            </button>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {request.title}
                  </h1>
                  {request.description && (
                    <p className="text-gray-600 mb-4">{request.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-2" />
                      {request.item_count || 0} items requested
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {request.required_by_date
                        ? `Due ${new Date(
                            request.required_by_date
                          ).toLocaleDateString()}`
                        : "No due date"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Created{" "}
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="ml-6 text-right">
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : request.status === "active"
                        ? "bg-blue-100 text-blue-800"
                        : request.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {request.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : request.status === "active" ? (
                      <Clock className="h-4 w-4 mr-1" />
                    ) : request.status === "pending" ? (
                      <Clock className="h-4 w-4 mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1" />
                    )}
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {totalOrders}
                  </div>
                  <div className="text-sm text-gray-600">Supplier Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {paidOrders}
                  </div>
                  <div className="text-sm text-gray-600">Paid Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    ${Number(totalValue).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${Number(paidValue).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Paid Amount</div>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Orders */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Supplier Orders ({supplierOrders.length})
            </h2>

            {supplierOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Supplier Orders Yet
                </h3>
                <p className="text-gray-600">
                  Suppliers haven't created orders for this request yet. Check
                  back later.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {supplierOrders.map((order) => (
                  <SupplierOrderCard
                    key={order.id}
                    order={order}
                    onSelectForPayment={handleSelectOrder}
                    onCancelOrder={handleCancelOrder}
                    isCancelling={isCancelling === order.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default withAuth(RestockRequestDetailsPage, {
  requiredRoles: ["STAFF", "BRANCH_MANAGER", "OWNER"],
});
