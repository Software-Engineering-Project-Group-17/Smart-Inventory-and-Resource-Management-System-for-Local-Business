import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { InventoryItem, InventoryFormData, Category, Unit } from "./types";
import { INVENTORY_CONSTANTS } from "./constants";

interface InventoryModalProps {
  isOpen: boolean;
  mode: "add" | "edit" | "view";
  item: InventoryItem | null;
  categories: Category[];
  units: Unit[];
  onClose: () => void;
  onSave: (data: InventoryFormData) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  mode,
  item,
  categories,
  units,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<InventoryFormData>({
    name: "",
    category: "",
    sku: "",
    quantity: 0,
    unit: "",
    expiryDate: "",
    costPrice: 0,
    sellingPrice: 0,
  });

  useEffect(() => {
    if (item && (mode === "edit" || mode === "view")) {
      setFormData({
        name: item.name,
        category: item.category,
        sku: item.sku,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
      });
    } else {
      setFormData({
        name: "",
        category: "",
        sku: "",
        quantity: 0,
        unit: "",
        expiryDate: "",
        costPrice: 0,
        sellingPrice: 0,
      });
    }
  }, [item, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== "view") {
      onSave(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "costPrice" || name === "sellingPrice"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  if (!isOpen) return null;

  const isReadOnly = mode === "view";
  const title =
    mode === "add"
      ? INVENTORY_CONSTANTS.messages.addNewItem
      : mode === "edit"
      ? INVENTORY_CONSTANTS.messages.editItem
      : INVENTORY_CONSTANTS.messages.viewItem;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {INVENTORY_CONSTANTS.labels.itemName} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {INVENTORY_CONSTANTS.labels.category} *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {INVENTORY_CONSTANTS.labels.sku} *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {INVENTORY_CONSTANTS.labels.quantity} *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                min="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {INVENTORY_CONSTANTS.labels.unit} *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.name}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {INVENTORY_CONSTANTS.labels.expiryDate} *
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {INVENTORY_CONSTANTS.labels.costPrice} *
              </label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {INVENTORY_CONSTANTS.labels.sellingPrice} *
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              {mode === "view" ? "Close" : "Cancel"}
            </button>
            {mode !== "view" && (
              <button
                type="submit"
                className="flex-1 px-6 py-3 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                style={{ backgroundColor: INVENTORY_CONSTANTS.colors.primary }}
              >
                <Save size={20} />
                {mode === "add" ? "Add Item" : "Save Changes"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
