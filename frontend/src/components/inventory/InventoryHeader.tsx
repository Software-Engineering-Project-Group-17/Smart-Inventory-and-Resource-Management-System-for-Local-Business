import React from "react";
import { Package } from "lucide-react";
import { INVENTORY_CONSTANTS } from "./constants";

interface InventoryHeaderProps {
  totalItems: number;
  onAddItem: () => void;
}

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  totalItems,
  onAddItem,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl text-white"
            style={{ backgroundColor: INVENTORY_CONSTANTS.colors.primary }}
          >
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {INVENTORY_CONSTANTS.messages.pageTitle}
            </h1>
            <p className="text-gray-600">
              {INVENTORY_CONSTANTS.messages.pageSubtitle}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {totalItems} {INVENTORY_CONSTANTS.labels.totalItems}
            </p>
          </div>
        </div>

        <button
          onClick={onAddItem}
          className="flex items-center gap-2 px-4 py-3 text-white rounded-lg transition-colors duration-200"
          style={{ backgroundColor: INVENTORY_CONSTANTS.colors.primary }}
        >
          <Package size={20} />
          {INVENTORY_CONSTANTS.messages.addItem}
        </button>
      </div>
    </div>
  );
};
