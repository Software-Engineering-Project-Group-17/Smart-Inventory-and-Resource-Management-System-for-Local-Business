"use client";
import React from "react";
import { Plus, Store } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  onCreateRequest: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onCreateRequest }) => {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restock Requests</h1>
          <p className="text-gray-600 mt-2">
            Create and manage inventory restock requests for low stock items
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>
              <strong>How it works:</strong> Staff identify low stock items →
              Create restock requests → Suppliers view and respond to requests →
              Items are restocked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/inventory/suppliers")}
            className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition-colors"
          >
            <Store className="h-4 w-4 mr-2" />
            View Suppliers
          </button>
          <button
            onClick={onCreateRequest}
            className="inline-flex items-center px-4 py-2 bg-[#3674B5] text-white rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
