"use client";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { getUserProfile } from "@/lib/auth";
import {
  CreateRestockRequest,
  RestockRequestItem,
  RESTOCK_PRIORITIES,
} from "@/types/restock";
import { InventoryItem } from "@/lib/api/inventory";
import { toastUtils } from "@/lib/toast-utils";

interface CreateRestockRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableInventory: InventoryItem[];
  allInventory: InventoryItem[];
}

const CreateRestockRequestModal: React.FC<CreateRestockRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  availableInventory,
  allInventory,
}) => {
  const [formData, setFormData] = useState<CreateRestockRequest>({
    title: "",
    description: "",
    priority: "normal",
    required_by_date: "",
    notes: "",
    items: [],
  });

  const [selectedInventoryId, setSelectedInventoryId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [itemNotes, setItemNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventoryMode, setInventoryMode] = useState<"low-stock" | "all">(
    "low-stock"
  );

  const addItem = () => {
    if (!selectedInventoryId || !quantity) return;

    const currentInventoryList =
      inventoryMode === "low-stock" ? availableInventory : allInventory;
    const inventoryItem = currentInventoryList.find(
      (item) => item.inventoryId.toString() === selectedInventoryId
    );

    if (!inventoryItem) return;

    const newItem: RestockRequestItem = {
      inventory_id: inventoryItem.inventoryId,
      requested_quantity: parseInt(quantity),
      notes: itemNotes,
      inventory_name: inventoryItem.itemName,
      current_stock: inventoryItem.currentStock,
      low_stock_threshold: inventoryItem.reorderLevel,
      category_name: inventoryItem.categoryName,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Reset item form
    setSelectedInventoryId("");
    setQuantity("1");
    setItemNotes("");
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toastUtils.validationError(
        "No Items Added",
        "Please add at least one item to the restock request"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Get user profile for authentication
      const userProfile = getUserProfile();

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (userProfile) {
        headers["x-user-id"] = userProfile.id;
        headers["x-user-email"] = userProfile.email;
      }

      const response = await fetch("/api/restock-requests", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toastUtils.formSuccess(
          `Restock request created successfully! ID: ${result.request.id}`
        );
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          title: "",
          description: "",
          priority: "normal",
          required_by_date: "",
          notes: "",
          items: [],
        });
        setSelectedInventoryId("");
        setQuantity("1");
        setItemNotes("");
        setInventoryMode("low-stock");
      } else {
        const error = await response.json();
        toastUtils.error(
          "Creation Failed",
          error.error || "Failed to create restock request"
        );
      }
    } catch (error) {
      console.error("Error creating restock request:", error);
      toastUtils.error("Request Failed", "Failed to create restock request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Restock Request
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter request title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(RESTOCK_PRIORITIES).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required By Date
              </label>
              <input
                type="date"
                value={formData.required_by_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    required_by_date: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter request description"
            />
          </div>

          {/* Add Items Section */}
          <div className="border rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Items</h3>

              {/* Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setInventoryMode("low-stock");
                    setSelectedInventoryId("");
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    inventoryMode === "low-stock"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Low Stock Items ({availableInventory.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInventoryMode("all");
                    setSelectedInventoryId("");
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    inventoryMode === "all"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All Items ({allInventory.length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {inventoryMode === "low-stock"
                    ? "Low Stock Inventory Items"
                    : "All Inventory Items"}
                </label>
                <select
                  value={selectedInventoryId}
                  onChange={(e) => setSelectedInventoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">
                    {inventoryMode === "low-stock"
                      ? "Select a low stock item"
                      : "Select an inventory item"}
                  </option>
                  {(inventoryMode === "low-stock"
                    ? availableInventory
                    : allInventory
                  ).map((item) => {
                    if (inventoryMode === "low-stock") {
                      const urgencyLevel =
                        item.currentStock <= item.reorderLevel * 0.5
                          ? "CRITICAL"
                          : item.currentStock <= item.reorderLevel * 0.75
                          ? "HIGH"
                          : "MEDIUM";
                      const urgencyColor =
                        urgencyLevel === "CRITICAL"
                          ? "🔴"
                          : urgencyLevel === "HIGH"
                          ? "🟡"
                          : "🟠";

                      return (
                        <option key={item.inventoryId} value={item.inventoryId}>
                          {urgencyColor} {item.itemName} - Stock:{" "}
                          {item.currentStock}/{item.reorderLevel} (
                          {item.categoryName})
                        </option>
                      );
                    } else {
                      const stockStatus =
                        item.currentStock <= item.reorderLevel ? "⚠️" : "🟢";
                      return (
                        <option key={item.inventoryId} value={item.inventoryId}>
                          {stockStatus} {item.itemName} - Stock:{" "}
                          {item.currentStock} ({item.categoryName})
                        </option>
                      );
                    }
                  })}
                </select>
                {selectedInventoryId && (
                  <div className="mt-1 text-xs text-gray-600">
                    {(() => {
                      const currentInventoryList =
                        inventoryMode === "low-stock"
                          ? availableInventory
                          : allInventory;
                      const item = currentInventoryList.find(
                        (i) => i.inventoryId.toString() === selectedInventoryId
                      );
                      if (!item) return null;

                      if (inventoryMode === "low-stock") {
                        const deficit = item.reorderLevel - item.currentStock;
                        const suggestedQuantity = Math.max(
                          deficit,
                          item.reorderLevel
                        );
                        return (
                          <span className="text-blue-600">
                            Suggested quantity: {suggestedQuantity} units
                            (Current: {item.currentStock}, Target:{" "}
                            {item.reorderLevel})
                          </span>
                        );
                      } else {
                        const isLowStock =
                          item.currentStock <= item.reorderLevel;
                        return (
                          <div className="flex flex-col">
                            <span
                              className={
                                isLowStock
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }
                            >
                              Current stock: {item.currentStock} units
                              {isLowStock &&
                                ` (Below reorder level: ${item.reorderLevel})`}
                            </span>
                            {isLowStock && (
                              <span className="text-blue-600">
                                Suggested quantity:{" "}
                                {Math.max(
                                  item.reorderLevel - item.currentStock,
                                  item.reorderLevel
                                )}{" "}
                                units
                              </span>
                            )}
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Needed
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    selectedInventoryId
                      ? (() => {
                          const currentInventoryList =
                            inventoryMode === "low-stock"
                              ? availableInventory
                              : allInventory;
                          const item = currentInventoryList.find(
                            (i) =>
                              i.inventoryId.toString() === selectedInventoryId
                          );
                          if (!item) return "1";

                          if (inventoryMode === "low-stock") {
                            const deficit =
                              item.reorderLevel - item.currentStock;
                            return Math.max(
                              deficit,
                              item.reorderLevel
                            ).toString();
                          } else {
                            const isLowStock =
                              item.currentStock <= item.reorderLevel;
                            if (isLowStock) {
                              const deficit =
                                item.reorderLevel - item.currentStock;
                              return Math.max(
                                deficit,
                                item.reorderLevel
                              ).toString();
                            }
                            return "1";
                          }
                        })()
                      : "1"
                  }
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!selectedInventoryId || !quantity}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Item
                </button>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Item notes (optional)"
              />
            </div>
          </div>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Items ({formData.items.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Item
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Current Stock
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Requested Qty
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <div>
                            <div className="font-medium">
                              {item.inventory_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.category_name}
                            </div>
                            {item.notes && (
                              <div className="text-sm text-gray-400">
                                {item.notes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <div className="flex flex-col">
                            <span
                              className={`px-2 py-1 rounded-full text-xs inline-block w-fit ${
                                (item.current_stock || 0) <=
                                (item.low_stock_threshold || 0) * 0.5
                                  ? "bg-red-100 text-red-800"
                                  : (item.current_stock || 0) <=
                                    (item.low_stock_threshold || 0) * 0.75
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {item.current_stock} / {item.low_stock_threshold}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {(item.current_stock || 0) <=
                              (item.low_stock_threshold || 0) * 0.5
                                ? "Critical"
                                : (item.current_stock || 0) <=
                                  (item.low_stock_threshold || 0) * 0.75
                                ? "High Priority"
                                : "Medium Priority"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.requested_quantity}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes for this request"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.items.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRestockRequestModal;
