"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Package,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { withAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/lib/auth";
import {
  RestockRequest,
  CreateRestockRequest,
  RestockRequestItem,
  RESTOCK_STATUSES,
  RESTOCK_PRIORITIES,
} from "@/types/restock";
import { InventoryItem } from "@/lib/api/inventory";

// Create Restock Request Modal Component
const CreateRestockRequestModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableInventory: InventoryItem[];
}> = ({ isOpen, onClose, onSuccess, availableInventory }) => {
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

  const addItem = () => {
    if (!selectedInventoryId || !quantity) return;

    const inventoryItem = availableInventory.find(
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
      alert("Please add at least one item to the restock request");
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
        alert(`Restock request created successfully! ID: ${result.request.id}`);
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
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create restock request");
      }
    } catch (error) {
      console.error("Error creating restock request:", error);
      alert("Failed to create restock request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Items
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Inventory Items
                </label>
                <select
                  value={selectedInventoryId}
                  onChange={(e) => setSelectedInventoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a low stock item</option>
                  {availableInventory.map((item) => {
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
                  })}
                </select>
                {selectedInventoryId && (
                  <div className="mt-1 text-xs text-gray-600">
                    {(() => {
                      const item = availableInventory.find(
                        (i) => i.inventoryId.toString() === selectedInventoryId
                      );
                      if (!item) return null;
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
                          const item = availableInventory.find(
                            (i) =>
                              i.inventoryId.toString() === selectedInventoryId
                          );
                          if (!item) return "1";
                          const deficit = item.reorderLevel - item.currentStock;
                          return Math.max(
                            deficit,
                            item.reorderLevel
                          ).toString();
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

// Main Restock Requests Page
const RestockRequestsPage = () => {
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [availableInventory, setAvailableInventory] = useState<InventoryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (searchTerm) params.append("search", searchTerm);

      // Get user profile for authentication
      const userProfile = getUserProfile();

      const headers: HeadersInit = {};
      if (userProfile) {
        headers["x-user-id"] = userProfile.id;
        headers["x-user-email"] = userProfile.email;
      }

      const response = await fetch(`/api/restock-requests?${params}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Failed to load restock requests");
      }
    } catch (err) {
      setError("Failed to load restock requests");
      console.error("Error loading requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      // Get user profile for authentication
      const userProfile = getUserProfile();

      const headers: HeadersInit = {};
      if (userProfile) {
        headers["x-user-id"] = userProfile.id;
        headers["x-user-email"] = userProfile.email;
      }

      const response = await fetch("/api/inventory-branch", {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        // Filter to show only low stock items and sort by urgency
        const lowStockItems = data.inventory
          .filter(
            (item: InventoryItem) => item.currentStock <= item.reorderLevel
          )
          .sort((a: InventoryItem, b: InventoryItem) => {
            // Sort by urgency: items with lower stock relative to threshold first
            const aUrgency = a.currentStock / (a.reorderLevel || 1);
            const bUrgency = b.currentStock / (b.reorderLevel || 1);
            return aUrgency - bUrgency;
          });

        setAvailableInventory(lowStockItems);
      }
    } catch (err) {
      console.error("Error loading inventory:", err);
    }
  };

  useEffect(() => {
    loadRequests();
    loadInventory();
  }, [statusFilter, priorityFilter, searchTerm]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "active":
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    return (
      RESTOCK_STATUSES[status as keyof typeof RESTOCK_STATUSES]?.color || "gray"
    );
  };

  const getPriorityColor = (priority: string) => {
    return (
      RESTOCK_PRIORITIES[priority as keyof typeof RESTOCK_PRIORITIES]?.color ||
      "gray"
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Restock Requests
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadRequests}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Restock Requests
                </h1>
                <p className="text-gray-600 mt-2">
                  Create and manage inventory restock requests for low stock
                  items
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    <strong>How it works:</strong> Staff identify low stock
                    items → Create restock requests → Suppliers view and respond
                    to requests → Items are restocked
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Request
              </button>
            </div>
          </div>

          {/* Low Stock Items Alert */}
          {availableInventory.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">
                    Low Stock Alert - {availableInventory.length} Items Need
                    Attention
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    The following items in your branch are running low and may
                    need restocking:
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
                        MEDIUM:
                          "bg-yellow-100 text-yellow-800 border-yellow-200",
                      };

                      return (
                        <div
                          key={item.inventoryId}
                          className={`p-3 rounded-lg border ${urgencyColors[urgencyLevel]}`}
                        >
                          <div className="font-medium text-sm">
                            {item.itemName}
                          </div>
                          <div className="text-xs mt-1">
                            Stock: {item.currentStock} / Target:{" "}
                            {item.reorderLevel}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">{urgencyLevel}</span>{" "}
                            Priority
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {availableInventory.length > 6 && (
                    <p className="text-yellow-700 mt-3 text-sm">
                      And {availableInventory.length - 6} more items need
                      attention...
                    </p>
                  )}
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Restock Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search requests..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(RESTOCK_STATUSES).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Priorities</option>
                  {Object.entries(RESTOCK_PRIORITIES).map(
                    ([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter("");
                    setPriorityFilter("");
                    setSearchTerm("");
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
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
            ) : requests.length === 0 ? (
              <div className="p-6 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No restock requests found
                </h3>
                <p className="text-gray-600 mb-4">
                  No requests match your current filters or you haven't created
                  any yet.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Request
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Required By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.title}
                            </div>
                            {request.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {request.description}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              Created{" "}
                              {new Date(
                                request.created_at
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(
                              request.status
                            )}-100 text-${getStatusColor(request.status)}-800`}
                          >
                            {getStatusIcon(request.status)}
                            <span className="ml-1">
                              {RESTOCK_STATUSES[
                                request.status as keyof typeof RESTOCK_STATUSES
                              ]?.label || request.status}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getPriorityColor(
                              request.priority
                            )}-100 text-${getPriorityColor(
                              request.priority
                            )}-800`}
                          >
                            {RESTOCK_PRIORITIES[
                              request.priority as keyof typeof RESTOCK_PRIORITIES
                            ]?.label || request.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <span className="font-medium">
                              {request.item_count || 0}
                            </span>{" "}
                            items
                          </div>
                          <div className="text-xs text-gray-500">
                            Qty: {request.total_quantity_requested || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.required_by_date ? (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(
                                request.required_by_date
                              ).toLocaleDateString()}
                            </div>
                          ) : (
                            "Not specified"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <CreateRestockRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadRequests}
        availableInventory={availableInventory}
      />
    </div>
  );
};

export default withAuth(RestockRequestsPage, {
  requiredRoles: ["STAFF", "BRANCH_MANAGER", "OWNER"],
});
