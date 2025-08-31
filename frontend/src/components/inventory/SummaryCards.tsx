import React from 'react';
import { Package, AlertCircle, Tag, DollarSign } from 'lucide-react';
import { InventoryItem, Category } from '@/types/Inventory';

interface SummaryCardsProps {
  inventory: InventoryItem[];
  categories: Category[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ inventory, categories }) => {
  const totalValue = inventory.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const lowStockItems = inventory.filter(item => item.quantity < 50).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#3674B5" }}>
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#FADA7A" }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Low Stock</p>
            <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#3674B5" }}>
            <Tag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#FADA7A" }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              LKR {totalValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;