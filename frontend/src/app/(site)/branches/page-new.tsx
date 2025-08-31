"use client";
import React from "react";
import { withAuth } from "@/hooks/useAuth";
import SummaryCards from "@/components/Owners/SummaryCards";
import AddManagerModal from "@/components/Owners/AddManagerModal";
import RemoveManagerModal from "@/components/Owners/RemoveManagerModal";
import DeleteBranchModal from "@/components/Owners/DeleteBranchModal";

// Import our modular components
import { BranchHeader } from "@/components/branches/BranchHeader";
import { ErrorNotification } from "@/components/branches/ErrorNotification";
import { BranchFilters } from "@/components/branches/BranchFilters";
import { BranchTable } from "@/components/branches/BranchTable";
import { useBranchManagement } from "@/components/branches/useBranchManagement";

const BranchesPage = () => {
  const {
    // Data
    branches,
    allBranches,
    isLoading,
    error,
    currentUserEmail,
    filters,
    modalState,

    // Actions
    fetchBranches,
    handleSearch,
    handleAddManager,
    handleRemoveManager,
    handleDeleteBranch,
    handleLogin,

    // Modal actions
    openAddManagerModal,
    openRemoveManagerModal,
    openDeleteModal,
    closeModals,
    setManagerEmail,
    setSelectedManagerEmail,
  } = useBranchManagement();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <BranchHeader currentUserEmail={currentUserEmail} />

          {/* Summary Cards */}
          <SummaryCards branches={allBranches} />

          {/* Error State */}
          {error && <ErrorNotification error={error} onRetry={fetchBranches} />}

          {/* Search and Filters */}
          <BranchFilters
            searchTerm={filters.searchTerm}
            onSearch={handleSearch}
            onRefresh={fetchBranches}
            isLoading={isLoading}
          />

          {/* Branches Table */}
          <BranchTable
            branches={branches}
            isLoading={isLoading}
            searchTerm={filters.searchTerm}
            onCreateManager={openAddManagerModal}
            onRemoveManager={openRemoveManagerModal}
            onLogin={handleLogin}
            onDelete={openDeleteModal}
          />
        </div>

        {/* Modals */}
        {modalState.showAddManagerModal && modalState.selectedBranch && (
          <AddManagerModal
            isOpen={modalState.showAddManagerModal}
            onClose={closeModals}
            branch={modalState.selectedBranch}
            managerEmail={modalState.managerEmail}
            setManagerEmail={setManagerEmail}
            handleAddManager={handleAddManager}
            isProcessing={modalState.isProcessing}
          />
        )}

        {modalState.showRemoveManagerModal && modalState.selectedBranch && (
          <RemoveManagerModal
            isOpen={modalState.showRemoveManagerModal}
            onClose={closeModals}
            branch={modalState.selectedBranch}
            selectedManagerEmail={modalState.selectedManagerEmail}
            setSelectedManagerEmail={setSelectedManagerEmail}
            handleRemoveManager={handleRemoveManager}
            isProcessing={modalState.isProcessing}
          />
        )}

        {modalState.showDeleteModal && modalState.selectedBranch && (
          <DeleteBranchModal
            isOpen={modalState.showDeleteModal}
            onClose={closeModals}
            branch={modalState.selectedBranch}
            handleDeleteBranch={handleDeleteBranch}
            isProcessing={modalState.isProcessing}
          />
        )}
      </div>
    </div>
  );
};

// Protect this page for OWNER role (owners manage their branches)
export default withAuth(BranchesPage, {
  requiredRoles: ["OWNER"],
});
