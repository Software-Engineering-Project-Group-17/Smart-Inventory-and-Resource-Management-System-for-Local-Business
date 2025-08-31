"use client";
import React from "react";
import { withAuth } from "@/hooks/useAuth";

// Import our modular components
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryFiltersComponent } from "@/components/inventory/InventoryFilters";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryModal } from "@/components/inventory/InventoryModal";
import { useInventoryManagement } from "@/components/inventory/useInventoryManagement";

const InventoryPage = () => {
  const {
    // Data
    inventory,
    categories,
    units,
    filters,

    // Modal state
    isModalOpen,
    modalMode,
    editingItem,

    // Actions
    handleSearch,
    handleCategoryFilter,
    toggleViewMode,
    openAddModal,
    openEditModal,
    openViewModal,
    closeModal,
    addItem,
    updateItem,
    deleteItem,
  } = useInventoryManagement();

  const handleSave = (formData: any) => {
    if (modalMode === "add") {
      addItem(formData);
    } else if (modalMode === "edit") {
      updateItem(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <InventoryHeader
            totalItems={inventory.length}
            onAddItem={openAddModal}
          />

          {/* Filters */}
          <InventoryFiltersComponent
            filters={filters}
            categories={categories}
            onSearch={handleSearch}
            onCategoryFilter={handleCategoryFilter}
            onToggleView={toggleViewMode}
          />

          {/* Inventory Table/Grid */}
          <InventoryTable
            items={inventory}
            viewMode={filters.viewMode}
            onEdit={openEditModal}
            onView={openViewModal}
            onDelete={deleteItem}
          />

          {/* Modal */}
          <InventoryModal
            isOpen={isModalOpen}
            mode={modalMode}
            item={editingItem}
            categories={categories}
            units={units}
            onClose={closeModal}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default withAuth(InventoryPage, {
  requiredRoles: ["STAFF", "BRANCH_MANAGER", "OWNER"],
});
