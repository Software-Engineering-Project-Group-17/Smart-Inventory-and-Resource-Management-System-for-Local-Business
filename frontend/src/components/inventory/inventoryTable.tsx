import React from 'react';
import { Edit, Eye, Save, X, Package } from 'lucide-react';
import { InventoryItem, Category, Unit } from '@/types/Inventory';

interface InventoryTableProps {
  items: InventoryItem[];
  editingId: string | null;
  editingItem: InventoryItem | null;
  categories: Category[];
  units: Unit[];
  onEdit: (item: InventoryItem) => void;
  onSave: () => void;
  onCancel: () => void;
  onUpdateEditingItem: (updates: Partial<InventoryItem>) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  editingId,
  editingItem,
  categories,
  units,
  onEdit,
  onSave,
  onCancel,
  onUpdateEditingItem
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: "#3674B5" }}>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">SKU</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Quantity</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Unit</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Expiry Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Cost Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Selling Price</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editingItem?.name || ''}
                      onChange={(e) => onUpdateEditingItem({ name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    />
                  ) : (
                    <div className="font-medium text-gray-900">{item.name}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <select
                      value={editingItem?.category || ''}
                      onChange={(e) => onUpdateEditingItem({ category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#FADA7A", color: "#92400e" }}>
                      {item.category}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editingItem?.sku || ''}
                      onChange={(e) => onUpdateEditingItem({ sku: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-600 font-mono">{item.sku}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      value={editingItem?.quantity || ''}
                      onChange={(e) => onUpdateEditingItem({ quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    />
                  ) : (
                    <span className={`font-medium ${item.quantity < 50 ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.quantity}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <select
                      value={editingItem?.unit || ''}
                      onChange={(e) => onUpdateEditingItem({ unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    >
                      {units.map(unit => (
                        <option key={unit.id} value={unit.name}>{unit.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-600 font-medium">{item.unit}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <input
                      type="date"
                      value={editingItem?.expiryDate || ''}
                      onChange={(e) => onUpdateEditingItem({ expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-600">{item.expiryDate}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editingItem?.costPrice || ''}
                      onChange={(e) => onUpdateEditingItem({ costPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-900 font-medium">LKR {item.costPrice.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editingItem?.sellingPrice || ''}
                      onChange={(e) => onUpdateEditingItem({ sellingPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    />
                  ) : (
                    <span className="text-green-600 font-medium">LKR {item.sellingPrice.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={onSave}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={onCancel}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => alert(`Supplier details for ${item.name}`)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No items found</p>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTable;