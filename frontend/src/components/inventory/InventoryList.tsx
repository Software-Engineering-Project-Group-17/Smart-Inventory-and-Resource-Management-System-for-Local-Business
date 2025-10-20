import React, { useState } from "react";
import { Package, AlertTriangle, Edit2, Check, X } from "lucide-react";
import { InventoryItem } from "@/lib/api/inventory";
import { getUserProfile, hasAnyRole } from "@/lib/auth";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { toastUtils } from "@/lib/toast-utils";
import { ROLES } from "@/lib/roles";

interface InventoryTableProps {
  inventory: InventoryItem[];
  isLoading: boolean;
  onInventoryUpdate?: () => void;
}

interface EditingState {
  inventoryId: number | null;
  quantity: string;
  unitPrice: string;
  lowStockThreshold: string;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory,
  isLoading,
  onInventoryUpdate,
}) => {
  const [editing, setEditing] = useState<EditingState>({
    inventoryId: null,
    quantity: "",
    unitPrice: "",
    lowStockThreshold: "",
  });
  const [saving, setSaving] = useState(false);

  // Check if user can edit (OWNER or BRANCH_MANAGER)
  const canEdit = hasAnyRole([ROLES.OWNER, ROLES.BRANCH_MANAGER]);

  const startEditing = (item: InventoryItem) => {
    setEditing({
      inventoryId: item.inventoryId,
      quantity: item.currentStock.toString(),
      unitPrice: item.unitPrice.toString(),
      lowStockThreshold: item.reorderLevel.toString(),
    });
  };

  const cancelEditing = () => {
    setEditing({
      inventoryId: null,
      quantity: "",
      unitPrice: "",
      lowStockThreshold: "",
    });
  };

  const saveChanges = async () => {
    if (!editing.inventoryId) return;

    setSaving(true);
    try {
      const body: any = {
        inventoryId: editing.inventoryId,
        quantity: parseInt(editing.quantity),
        unitPrice: parseFloat(editing.unitPrice),
      };

      if (editing.lowStockThreshold !== "") {
        body.lowStockThreshold = parseInt(editing.lowStockThreshold);
      }

      const response = await authenticatedFetch("/api/inventory", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toastUtils.formSuccess("Inventory updated successfully!");
        cancelEditing();
        onInventoryUpdate?.();
      } else {
        const errorData = await response.json();
        toastUtils.error(
          "Update Failed",
          errorData.error || "Failed to update inventory"
        );
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      toastUtils.networkError();
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No inventory items found
          </h3>
          <p className="text-gray-600">
            No items match your current search criteria or filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Low Stock Threshold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {canEdit && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => {
              const isLowStock = item.currentStock <= item.reorderLevel;
              const totalValue = item.currentStock * item.unitPrice;
              const isEditing = editing.inventoryId === item.inventoryId;

              return (
                <tr key={item.inventoryId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.itemName}
                      </div>
                      {item.barcode && (
                        <div className="text-xs text-gray-500">
                          Barcode: {item.barcode}
                        </div>
                      )}
                      {item.description && (
                        <div className="text-sm text-gray-500">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.categoryName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editing.quantity}
                        onChange={(e) =>
                          setEditing({ ...editing, quantity: e.target.value })
                        }
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#3674B5] focus:border-[#3674B5]"
                        disabled={saving}
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {item.currentStock}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editing.unitPrice}
                        onChange={(e) =>
                          setEditing({ ...editing, unitPrice: e.target.value })
                        }
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#3674B5] focus:border-[#3674B5]"
                        disabled={saving}
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        ${Number(item.unitPrice).toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editing.lowStockThreshold}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            lowStockThreshold: e.target.value,
                          })
                        }
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#3674B5] focus:border-[#3674B5]"
                        disabled={saving}
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {item.reorderLevel}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Number(totalValue).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isLowStock ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Stock
                      </span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={saveChanges}
                            disabled={saving}
                            className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                            title="Save changes"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={saving}
                            className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                            title="Cancel editing"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(item)}
                          className="p-1 text-[#3674B5] hover:text-blue-700"
                          title="Edit stock and price"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
