import React from 'react';
import { Package } from 'lucide-react';

const InventoryHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="p-3 rounded-xl text-white"
          style={{ backgroundColor: "#3674B5" }}
        >
          <Package size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your hardware store inventory</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryHeader;