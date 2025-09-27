"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  MapPin,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle,
  DollarSign,
  X,
} from "lucide-react";

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

interface OrderCardProps {
  order: Order;
  processingAction: { orderId: number; action: "pay" | "cancel" } | null;
  onPayLater: (orderId: number) => void;
  onCancelOrder: (orderId: number) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  processingAction,
  onPayLater,
  onCancelOrder,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const canPayOrder = (order: Order) => {
    return (
      order.order_status === "pending" && order.payment_status === "unpaid"
    );
  };

  const canCancelOrder = (order: Order) => {
    return (
      order.order_status === "pending" && order.payment_status === "unpaid"
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "processing":
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
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

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{order.id}
              </h3>
              <div
                className={`px-3 py-1 flex rounded-full text-xs font-medium border ${getStatusColor(
                  order.order_status
                )}`}
              >
                {getStatusIcon(order.order_status)}
                <span className="ml-1 capitalize">{order.order_status}</span>
                {order.order_status === "pending" &&
                  order.payment_status === "unpaid" && (
                    <span className="ml-1 text-xs">- Payment Required</span>
                  )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                  order.payment_status
                )}`}
              >
                <CreditCard className="w-3 h-3 inline mr-1" />
                {order.payment_status.charAt(0).toUpperCase() +
                  order.payment_status.slice(1)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(order.created_at)}
              </span>
              {order.shipping_address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {order.shipping_address.slice(0, 50)}
                  {order.shipping_address.length > 50 ? "..." : ""}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${order.total_amount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {canPayOrder(order) && (
                <button
                  onClick={() => onPayLater(order.id)}
                  disabled={
                    processingAction?.orderId === order.id &&
                    processingAction?.action === "pay"
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {processingAction?.orderId === order.id &&
                  processingAction?.action === "pay" ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <DollarSign className="w-4 h-4" />
                  )}
                  Pay Now
                </button>
              )}

              {canCancelOrder(order) && (
                <button
                  onClick={() => onCancelOrder(order.id)}
                  disabled={
                    processingAction?.orderId === order.id &&
                    processingAction?.action === "cancel"
                  }
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {processingAction?.orderId === order.id &&
                  processingAction?.action === "cancel" ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Cancel
                </button>
              )}

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items (Expandable) */}
      {isExpanded && (
        <div className="p-6 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.inventory_name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center border">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">
                    {item.product.inventory_name}
                  </h5>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} × ${item.unit_price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${item.total_price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Order Details */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">Order Details</p>
                <p className="text-gray-600">Order ID: #{order.id}</p>
                <p className="text-gray-600">
                  Payment ID: {order.stripe_payment_intent_id.slice(0, 20)}...
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Timestamps</p>
                <p className="text-gray-600">
                  Created: {formatDate(order.created_at)}
                </p>
                <p className="text-gray-600">
                  Updated: {formatDate(order.updated_at)}
                </p>
              </div>
            </div>
            {order.shipping_address && (
              <div className="mt-4">
                <p className="font-medium text-gray-900">Shipping Address</p>
                <p className="text-gray-600">{order.shipping_address}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
