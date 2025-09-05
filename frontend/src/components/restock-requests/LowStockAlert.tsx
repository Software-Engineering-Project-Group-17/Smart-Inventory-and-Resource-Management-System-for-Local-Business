"use client";
import React from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { InventoryItem } from "@/lib/api/inventory";

interface LowStockAlertProps {
  availableInventory: InventoryItem[];
  onCreateRequest: () => void;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({
  availableInventory,
  onCreateRequest,
}) => {
  if (availableInventory.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Low Stock Alert - {availableInventory.length} Items Need Attention
          </h3>
          <p className="text-yellow-700 mb-4">
            The following items in your branch are running low and may need
            restocking:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableInventory.slice(0, 6).map((item) => {
              const urgencyLevel =
                item.currentStock <= item.reorderLevel * 0.5
                  ? "CRITICAL"
                  : item.currentStock <= item.reorderLevel * 0.75
                  ? "HIGH"
                  : "MEDIUM";
              const urgencyColors = {
                CRITICAL: "bg-red-100 text-red-800 border-red-200",
                HIGH: "bg-orange-100 text-orange-800 border-orange-200",
                MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
              };

              return (
                <div
                  key={item.inventoryId}
                  className={`p-3 rounded-lg border ${urgencyColors[urgencyLevel]}`}
                >
                  <div className="font-medium text-sm">{item.itemName}</div>
                  <div className="text-xs mt-1">
                    Stock: {item.currentStock} / Target: {item.reorderLevel}
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">{urgencyLevel}</span> Priority
                  </div>
                </div>
              );
            })}
          </div>
          {availableInventory.length > 6 && (
            <p className="text-yellow-700 mt-3 text-sm">
              And {availableInventory.length - 6} more items need attention...
            </p>
          )}
          <button
            onClick={onCreateRequest}
            className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Restock Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;
