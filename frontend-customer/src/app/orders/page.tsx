"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import {
  OrdersHeader,
  OrderList,
  EmptyOrdersState,
  NotificationBanner,
  LoadingState,
  ErrorState,
  LoginPrompt,
} from "@/components/orders";

interface OrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    inventory_id: number;
    inventory_name: string;
    image_url?: string;
  };
}

interface Order {
  id: number;
  total_amount: number;
  order_status: "pending" | "processing" | "completed" | "cancelled";
  payment_status: "paid" | "unpaid" | "refunded" | "failed";
  shipping_address?: string;
  stripe_payment_intent_id: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
  total_orders: number;
}

const OrdersPage = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<{
    orderId: number;
    action: "pay" | "cancel";
  } | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check for payment success from URL params
    const paymentStatus = searchParams.get("payment");
    const orderId = searchParams.get("order_id");

    if (paymentStatus === "success" && orderId) {
      setPaymentSuccess(
        `Payment completed successfully for Order #${orderId}!`
      );
      // Clear the URL params
      window.history.replaceState({}, "", "/orders");
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data: OrdersResponse = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handlePayLater = async (orderId: number) => {
    if (!user) return;

    try {
      setProcessingAction({ orderId, action: "pay" });

      const token = await user.getIdToken();
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "pay" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to prepare payment");
      }

      const data = await response.json();

      // For payment intents, redirect to a payment page or handle inline
      if (data.client_secret) {
        // Store the client secret and redirect to a payment page
        // For now, we'll create a simple payment flow
        const paymentUrl = `/payment?client_secret=${encodeURIComponent(
          data.client_secret
        )}&order_id=${orderId}`;
        window.location.href = paymentUrl;
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setProcessingAction({ orderId, action: "cancel" });

      const token = await user.getIdToken();
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "cancel" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel order");
      }

      // Refresh orders list
      await fetchOrders();
    } catch (err) {
      console.error("Cancel error:", err);
      setError(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setProcessingAction(null);
    }
  };

  // Early returns for different states
  if (!user) {
    return <LoginPrompt />;
  }

  if (loading) {
    return <LoadingState isLoading={loading} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchOrders} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrdersHeader />

        {/* Payment Success Message */}
        {paymentSuccess && (
          <NotificationBanner
            type="success"
            message={paymentSuccess}
            description="Your order is now being processed."
            onClose={() => setPaymentSuccess(null)}
          />
        )}

        {/* Error Message */}
        {error && (
          <NotificationBanner
            type="error"
            message="Error"
            description={error}
            onClose={() => setError(null)}
          />
        )}

        {orders.length === 0 ? (
          <EmptyOrdersState />
        ) : (
          <OrderList
            orders={orders}
            processingAction={processingAction}
            onPayLater={handlePayLater}
            onCancelOrder={handleCancelOrder}
          />
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
