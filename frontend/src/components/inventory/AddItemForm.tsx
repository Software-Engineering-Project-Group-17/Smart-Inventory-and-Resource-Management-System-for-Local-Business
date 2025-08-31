import React from 'react';
import { Plus, Check } from 'lucide-react';
import { Category, Unit, InventoryItem } from '@/types/Inventory';
import Dropdown from '@/components/inventory/DropDownOption';

interface AddItemFormProps {
  isVisible: boolean;
  onClose: () => void;
  newItem: Omit<InventoryItem, 'id'>;
  onUpdateItem: (updates: Partial<Omit<InventoryItem, 'id'>>) => void;
  onAddItem: () => void;
  categories: Category[];
  units: Unit[];
  showCategoryDropdown: boolean;
  onToggleCategoryDropdown: () => void;
  showUnitDropdown: boolean;
  onToggleUnitDropdown: () => void;
  onShowNewCategoryModal: () => void;
  onShowNewUnitModal: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({
  isVisible,
  onClose,
  newItem,
  onUpdateItem,
  onAddItem,
  categories,
  units,
  showCategoryDropdown,
  onToggleCategoryDropdown,
  showUnitDropdown,
  onToggleUnitDropdown,
  onShowNewCategoryModal,
  onShowNewUnitModal
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="p-2 rounded-lg text-white"
          style={{ backgroundColor: "#FADA7A" }}
        >
          <Plus size={20} />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">Add New Item</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => onUpdateItem({ name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter item name"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <Dropdown
            value={newItem.category}
            placeholder="Select category"
            options={categories}
            onSelect={(value) => onUpdateItem({ category: value })}
            isOpen={showCategoryDropdown}
            onToggle={onToggleCategoryDropdown}
            showAddNew={true}
            onAddNew={onShowNewCategoryModal}
            addNewLabel="+ Add New Category"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
          <input
            type="text"
            value={newItem.sku}
            onChange={(e) => onUpdateItem({ sku: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter SKU"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            value={newItem.quantity}
            onChange={(e) => onUpdateItem({ quantity: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="0"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
          <Dropdown
            value={newItem.unit}
            placeholder="Select unit"
            options={units}
            onSelect={(value) => onUpdateItem({ unit: value })}
            isOpen={showUnitDropdown}
            onToggle={onToggleUnitDropdown}
            showAddNew={true}
            onAddNew={onShowNewUnitModal}
            addNewLabel="+ Add New Unit"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
          <input
            type="date"
            value={newItem.expiryDate}
            onChange={(e) => onUpdateItem({ expiryDate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price</label>
          <input
            type="number"
            step="0.01"
            value={newItem.costPrice}
            onChange={(e) => onUpdateItem({ costPrice: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price</label>
          <input
            type="number"
            step="0.01"
            value={newItem.sellingPrice}
            onChange={(e) => onUpdateItem({ sellingPrice: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <button
          onClick={onClose}
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onAddItem}
          className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
          style={{ backgroundColor: "#3674B5" }}
          disabled={!newItem.name || !newItem.category || !newItem.sku || !newItem.unit}
        >
          <Check size={16} />
          Add Item
        </button>
      </div>
    </div>
  );
};

export default AddItemForm;