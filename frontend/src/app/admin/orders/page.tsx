import { ShoppingCart } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="text-primaryColor" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-textDark">Orders</h1>
          <p className="text-textLight">View and manage customer orders</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <p className="text-textLight">Orders management content goes here...</p>
      </div>
    </div>
  );
}
