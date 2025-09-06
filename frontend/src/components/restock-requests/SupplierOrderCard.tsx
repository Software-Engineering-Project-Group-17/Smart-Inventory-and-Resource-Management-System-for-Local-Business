"use client";
import React from "react";
import {
  DollarSign,
  Package,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  AlertTriangle,
  Ban,
} from "lucide-react";
import {
  SupplierOrder,
  SUPPLIER_ORDER_STATUSES,
  SUPPLIER_PAYMENT_STATUSES,
  AVAILABILITY_STATUSES,
} from "@/types/supplier-order";

interface SupplierOrderCardProps {
  order: SupplierOrder;
  onSelectForPayment: (order: SupplierOrder) => void;
  onCancelOrder?: (order: SupplierOrder) => void;
  isCancelling?: boolean;
}

export const SupplierOrderCard: React.FC<SupplierOrderCardProps> = ({
  order,
  onSelectForPayment,
  onCancelOrder,
  isCancelling = false,
}) => {
  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "unpaid":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
      case "refunded":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return (
      SUPPLIER_PAYMENT_STATUSES[
        status as keyof typeof SUPPLIER_PAYMENT_STATUSES
      ]?.color || "gray"
    );
  };

  const getOrderStatusColor = (status: string) => {
    return (
      SUPPLIER_ORDER_STATUSES[status as keyof typeof SUPPLIER_ORDER_STATUSES]
        ?.color || "gray"
    );
  };

  const getAvailabilityStatusColor = (status: string) => {
    return (
      AVAILABILITY_STATUSES[status as keyof typeof AVAILABILITY_STATUSES]
        ?.color || "gray"
    );
  };

  const canPay =
    order.payment_status === "unpaid" && order.order_status !== "cancelled";
  const canCancel =
    order.payment_status === "unpaid" &&
    order.order_status !== "cancelled" &&
    order.order_status !== "completed";
  const totalItems = order.items.length;
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.offered_quantity,
    0
  );

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {order.supplier_name}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getPaymentStatusColor(
                  order.payment_status
                )}-100 text-${getPaymentStatusColor(order.payment_status)}-800`}
              >
                {getPaymentStatusIcon(order.payment_status)}
                <span className="ml-1">
                  {SUPPLIER_PAYMENT_STATUSES[
                    order.payment_status as keyof typeof SUPPLIER_PAYMENT_STATUSES
                  ]?.label || order.payment_status}
                </span>
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getOrderStatusColor(
                  order.order_status
                )}-100 text-${getOrderStatusColor(order.order_status)}-800`}
              >
                {SUPPLIER_ORDER_STATUSES[
                  order.order_status as keyof typeof SUPPLIER_ORDER_STATUSES
                ]?.label || order.order_status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-2" />
                {totalItems} items ({totalQuantity} units)
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {order.estimated_delivery_date
                  ? `Delivery: ${new Date(
                      order.estimated_delivery_date
                    ).toLocaleDateString()}`
                  : "No delivery date"}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Created {new Date(order.created_at).toLocaleDateString()}
              </div>
            </div>

            {order.supplier_notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Supplier Notes:</strong> {order.supplier_notes}
                </p>
              </div>
            )}
          </div>

          <div className="ml-6 text-right">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${Number(order.total_amount).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mb-3">Total Amount</div>

            <div className="space-y-2">
              {canPay && (
                <button
                  onClick={() => onSelectForPayment(order)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#3674B5] text-white rounded-md hover:bg-blue-900 text-sm font-medium"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </button>
              )}

              {canCancel && onCancelOrder && (
                <button
                  onClick={() => onCancelOrder(order)}
                  disabled={isCancelling}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  {isCancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
            </div>

            {order.payment_status === "paid" && order.paid_at && (
              <div className="text-xs text-green-600">
                Paid on {new Date(order.paid_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Order Items ({totalItems})
        </h4>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Item
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Quantity
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Unit Price
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Total Price
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Availability
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Lead Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id} className="text-sm">
                  <td className="py-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.supplier_item_name || item.inventory_name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {item.category_name}
                      </div>
                      {item.supplier_item_description && (
                        <div className="text-gray-400 text-xs mt-1">
                          {item.supplier_item_description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-gray-900">
                    {item.offered_quantity}
                  </td>
                  <td className="py-3 text-gray-900">
                    ${Number(item.unit_price).toFixed(2)}
                  </td>
                  <td className="py-3 font-medium text-gray-900">
                    ${Number(item.total_price).toFixed(2)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getAvailabilityStatusColor(
                        item.availability_status
                      )}-100 text-${getAvailabilityStatusColor(
                        item.availability_status
                      )}-800`}
                    >
                      {AVAILABILITY_STATUSES[
                        item.availability_status as keyof typeof AVAILABILITY_STATUSES
                      ]?.label || item.availability_status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">
                    {item.lead_time_days > 0
                      ? `${item.lead_time_days} days`
                      : "Same day"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.estimated_delivery_date && (
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <Truck className="h-4 w-4 mr-2" />
            Estimated delivery:{" "}
            {new Date(order.estimated_delivery_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};
