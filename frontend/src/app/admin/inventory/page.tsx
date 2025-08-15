import { Package } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="text-primaryColor" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-textDark">
            Inventory Management
          </h1>
          <p className="text-textLight">
            Manage your products and stock levels
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <p className="text-textLight">
          Inventory management content goes here...
        </p>
      </div>
    </div>
  );
}
