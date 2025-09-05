"use client";
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  X,
  CreditCard,
  DollarSign,
  Package,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { SupplierOrder } from "@/types/supplier-order";

// Initialize Stripe with error handling
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables"
  );
}

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SupplierOrder;
  onSuccess: () => void;
}

interface PaymentFormProps {
  order: SupplierOrder;
  onSuccess: () => void;
  onClose: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  order,
  onSuccess,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supplier_order_id: order.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setClientSecret(data.client_secret);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to initialize payment");
        }
      } catch (err) {
        setError("Failed to initialize payment");
        console.error("Payment intent error:", err);
      }
    };

    createPaymentIntent();
  }, [order.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Card element not found");
      setIsProcessing(false);
      return;
    }

    try {
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: order.supplier_name,
            },
          },
        });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent.status === "succeeded") {
        // Confirm payment on our backend
        const confirmResponse = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntent.id,
            status: "succeeded",
          }),
        });

        if (confirmResponse.ok) {
          setPaymentSucceeded(true);
          setTimeout(() => {
            onSuccess();
          }, 2000);
        } else {
          setError("Payment succeeded but confirmation failed");
        }
        setIsProcessing(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsProcessing(false);
      console.error("Payment error:", err);
    }
  };

  if (paymentSucceeded) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-gray-600 mb-4">
          Your payment of ${Number(order.total_amount).toFixed(2)} has been
          processed successfully.
        </p>
        <p className="text-sm text-gray-500">
          Inventory will be updated and the order status will change to
          processing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Supplier:</span>
            <span className="font-medium">{order.supplier_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Items:</span>
            <span className="font-medium">{order.items.length} items</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Quantity:</span>
            <span className="font-medium">
              {order.items.reduce(
                (sum, item) => sum + item.offered_quantity,
                0
              )}{" "}
              units
            </span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span className="text-lg">
                ${Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Information
        </label>
        <div className="border border-gray-300 rounded-md p-3">
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
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing || !clientSecret}
          className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ${Number(order.total_amount).toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Process Payment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!stripePromise ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Configuration Error
              </h3>
              <p className="text-gray-600 mb-4">
                Stripe payment system is not properly configured.
              </p>
              <p className="text-sm text-gray-500">
                Please contact your administrator to set up the payment system.
              </p>
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <PaymentForm
                order={order}
                onSuccess={onSuccess}
                onClose={onClose}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};
