"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, CreditCard, MapPin, User } from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutFormProps {
  clientSecret: string;
  orderId: number;
  totalAmount: number;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  clientSecret,
  orderId,
  totalAmount,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, customerData } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setPaymentError("Card element not found");
      setIsProcessing(false);
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: customerData?.customer_name || user?.displayName || "Customer",
          email: customerData?.customer_email || user?.email || "",
        },
      },
    });

    if (result.error) {
      setPaymentError(result.error.message || "Payment failed");
    } else {
      // Payment succeeded
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment Information
        </h3>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
            },
          }}
        />
      </div>

      {paymentError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {paymentError}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-xl font-bold">
          Total: ${totalAmount.toFixed(2)}
        </div>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isProcessing
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isProcessing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

const CheckoutPage: React.FC = () => {
  const { user, customerData } = useAuth();
  const { items, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");

  const calculateTotal = () => {
    return items.reduce(
      (total, item) => total + item.unit_price * item.quantity,
      0
    );
  };

  useEffect(() => {
    const newTotal = items.reduce(
      (total, item) => total + item.unit_price * item.quantity,
      0
    );
    setTotalAmount(newTotal);
  }, [items]);

  const createOrder = async () => {
    if (!user || items.length === 0) {
      toastUtils.warning("Please login and add items to cart");
      return;
    }

    setIsCreatingOrder(true);
    setOrderError(null);

    // Create a promise for the order creation
    const orderPromise = (async () => {
      const token = await user.getIdToken();

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            inventory_id: item.inventory_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          shipping_address: shippingAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      return data;
    })();

    // Use promise toast for automatic loading/success/error handling
    toastUtils.promise(orderPromise, {
      loading: "Creating your order...",
      success: (data) => {
        setClientSecret(data.client_secret);
        setOrderId(data.order_id);
        setTotalAmount(data.total_amount);
        return `Order #${data.order_id} created successfully!`;
      },
      error: (error) => {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create order";
        setOrderError(errorMessage);
        return "Failed to create order. Please try again.";
      },
    });

    // Handle completion
    orderPromise.finally(() => {
      setIsCreatingOrder(false);
    });
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    clearCart();

    // Show payment success toast with view order action
    if (orderId) {
      toastUtils.paymentSuccess(totalAmount, () => {
        window.location.href = `/orders`;
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please login to checkout</h1>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. You will receive an email confirmation
            shortly.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <ShoppingCart className="h-8 w-8 mr-3" />
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Customer Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Customer Information
              </h3>
              <p className="text-sm text-gray-600">
                {customerData?.customer_name}
              </p>
              <p className="text-sm text-gray-600">
                {customerData?.customer_email}
              </p>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                Shipping Address
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter your shipping address..."
                required
              />
            </div>

            {/* Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.inventory_id}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <div>
                    <h4 className="font-medium">{item.inventory_name}</h4>
                    <p className="text-sm text-gray-600">
                      ${Number(item.unit_price).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="font-medium">
                    ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            {!clientSecret ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Create Order</h2>
                {orderError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {orderError}
                  </div>
                )}
                <button
                  onClick={createOrder}
                  disabled={
                    isCreatingOrder ||
                    items.length === 0 ||
                    !shippingAddress.trim()
                  }
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isCreatingOrder ||
                    items.length === 0 ||
                    !shippingAddress.trim()
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isCreatingOrder ? "Creating Order..." : "Proceed to Payment"}
                </button>
              </div>
            ) : (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  orderId={orderId!}
                  totalAmount={totalAmount}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
