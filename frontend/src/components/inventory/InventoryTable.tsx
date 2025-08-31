import React from "react";
import { Edit, Eye, Trash2 } from "lucide-react";
import { InventoryItem } from "./types";
import { INVENTORY_CONSTANTS } from "./constants";

interface InventoryTableProps {
  items: InventoryItem[];
  viewMode: "list" | "grid";
  onEdit: (item: InventoryItem) => void;
  onView: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  viewMode,
  onEdit,
  onView,
  onDelete,
}) => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  {INVENTORY_CONSTANTS.labels.quantity}:
                </span>
                <span className="text-sm font-medium">
                  {item.quantity} {item.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  {INVENTORY_CONSTANTS.labels.sellingPrice}:
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(item.sellingPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expires:</span>
                <span className="text-sm">{formatDate(item.expiryDate)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onView(item)}
                className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm"
              >
                <Eye size={16} className="inline mr-1" />
                View
              </button>
              <button
                onClick={() => onEdit(item)}
                className="flex-1 px-3 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200 text-sm"
              >
                <Edit size={16} className="inline mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            style={{ backgroundColor: INVENTORY_CONSTANTS.colors.primary }}
          >
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                {INVENTORY_CONSTANTS.labels.itemName}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                {INVENTORY_CONSTANTS.labels.category}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                {INVENTORY_CONSTANTS.labels.sku}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                {INVENTORY_CONSTANTS.labels.quantity}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                {INVENTORY_CONSTANTS.labels.sellingPrice}
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                {INVENTORY_CONSTANTS.labels.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg">
                      {INVENTORY_CONSTANTS.messages.noResults}
                    </p>
                    <p className="text-sm">
                      {INVENTORY_CONSTANTS.messages.noResultsDesc}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires: {formatDate(item.expiryDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(item.sellingPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onView(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Edit Item"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
