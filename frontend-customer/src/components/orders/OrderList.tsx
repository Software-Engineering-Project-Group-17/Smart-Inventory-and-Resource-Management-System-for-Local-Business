import React from "react";
import OrderCard from "./OrderCard";

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

interface OrderListProps {
  orders: Order[];
  processingAction: { orderId: number; action: "pay" | "cancel" } | null;
  onPayLater: (orderId: number) => void;
  onCancelOrder: (orderId: number) => void;
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  processingAction,
  onPayLater,
  onCancelOrder,
}) => {
  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          processingAction={processingAction}
          onPayLater={onPayLater}
          onCancelOrder={onCancelOrder}
        />
      ))}
    </div>
  );
};

export default OrderList;
