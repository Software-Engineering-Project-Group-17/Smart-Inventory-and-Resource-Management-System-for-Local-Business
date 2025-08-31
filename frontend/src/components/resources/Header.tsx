import React from 'react';
import { Truck } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="p-3 rounded-xl text-white"
          style={{ backgroundColor: "#3674B5" }}
        >
          <Truck size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Tracking</h1>
          <p className="text-gray-600">Manage and track your business resources</p>
        </div>
      </div>
    </div>
  );
};

export default Header;