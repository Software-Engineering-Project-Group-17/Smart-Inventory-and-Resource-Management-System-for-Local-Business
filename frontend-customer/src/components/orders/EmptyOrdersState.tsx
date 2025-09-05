import React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const EmptyOrdersState: React.FC = () => {
  return (
    <div className="text-center py-16">
      <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
      <p className="text-gray-600 mb-6">
        Start shopping to see your orders here!
      </p>
      <Link
        href="/shop"
        className="bg-zeta text-white px-6 py-3 rounded-lg hover:bg-zeta transition-colors inline-flex items-center gap-2"
      >
        <ShoppingBag className="w-5 h-5" />
        Start Shopping
      </Link>
    </div>
  );
};

export default EmptyOrdersState;
