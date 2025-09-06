"use client";
import React from "react";
import { RefreshCw, AlertTriangle, Plus } from "lucide-react";
import { withAuth } from "@/hooks/useAuth";
import { useInventoryData } from "@/hooks/useInventoryData";
import { InventoryTable } from "@/components/inventory/InventoryList";
import { StatsCards } from "@/components/inventory/StatsCards";
import { SimpleInventoryFilters } from "@/components/inventory/SimpleInventoryFilters";
import Link from "next/link";

const InventoryPage = () => {
  const {
    // Data
    inventory,
    categories,
    branch,
    stats,
    lowStockItems,

    // State
    isLoading,
    error,
    searchTerm,
    selectedCategory,
    showLowStockOnly,

    // Actions
    setSearchTerm,
    setSelectedCategory,
    setShowLowStockOnly,
    refreshInventory,
  } = useInventoryData();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Inventory
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshInventory}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
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
                  Inventory Management
                </h1>
                <p className="text-gray-600 mt-2">
                  {branch
                    ? `${branch.name} - ${branch.location}`
                    : "Loading branch info..."}
                </p>
              </div>
              <div className="flex flow-raw gap-2">
                <Link
                  href="/inventory/addCategory"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#3674B5] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Add Category
                </Link>
                <Link
                  href="/inventory/addItem"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#3674B5] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Link>
                <Link
                  href="/inventory/restock-requests"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#3674B5] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Restock Request
                </Link>
                <button
                  onClick={refreshInventory}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#3674B5] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && !showLowStockOnly && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Low Stock Alert
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    You have {lowStockItems.length} items with low stock that
                    need attention.
                    <button
                      onClick={() => setShowLowStockOnly(true)}
                      className="ml-2 text-red-600 underline hover:text-red-500"
                    >
                      View low stock items
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <SimpleInventoryFilters
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            showLowStockOnly={showLowStockOnly}
            categories={categories}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onLowStockToggle={setShowLowStockOnly}
          />

          {/* Inventory Table */}
          <InventoryTable inventory={inventory} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default withAuth(InventoryPage, {
  requiredRoles: ["STAFF", "BRANCH_MANAGER", "OWNER"],
});
