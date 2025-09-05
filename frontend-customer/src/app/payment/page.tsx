"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { CreditCard, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutFormProps {
  clientSecret: string;
  orderId: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  clientSecret,
  orderId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { user, customerData } = useAuth();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("Card element not found");
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
      setErrorMessage(result.error.message || "Payment failed");
      setIsProcessing(false);
    } else {
      // Payment succeeded - clear cart and redirect
      clearCart();
      router.push(`/orders?payment=success&order_id=${orderId}`);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
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

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-zeta text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Complete Payment
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const PaymentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientSecret = searchParams.get("client_secret");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (!clientSecret || !orderId) {
      router.push("/orders");
    }
  }, [clientSecret, orderId, router]);

  if (!clientSecret || !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#2563eb",
      colorBackground: "#ffffff",
      colorText: "#374151",
      colorDanger: "#dc2626",
      fontFamily: "system-ui, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px",
    },
  };

  // For CardElement, we don't need clientSecret in options
  const options = {
    appearance,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-zeta hover:text-zeta transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-zeta" />
            Complete Payment
          </h1>
          <p className="text-gray-600 mt-2">
            Order #{orderId} - Complete your payment to confirm the order
          </p>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm clientSecret={clientSecret} orderId={orderId} />
          </Elements>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
