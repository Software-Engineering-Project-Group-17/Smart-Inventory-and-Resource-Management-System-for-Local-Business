import React from "react";
import { Package } from "lucide-react";

const OrdersHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <Package className="w-8 h-8 text-zeta" />
        My Orders
      </h1>
      <p className="text-gray-600 mt-2">Track and manage your order history</p>
    </div>
  );
};

export default OrdersHeader;
