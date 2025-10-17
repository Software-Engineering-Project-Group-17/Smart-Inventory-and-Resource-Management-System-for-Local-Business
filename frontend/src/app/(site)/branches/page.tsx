"use client";
import React from "react";
import { withAuth } from "@/hooks/useAuth";
import { ROLES } from "@/lib/roles";

// Import existing modal components
import RemoveManagerModal from "@/components/Owners/RemoveManagerModal";
import DeleteBranchModal from "@/components/Owners/DeleteBranchModal";
import AddManagerModal from "@/components/Owners/AddManagerModal";
import SummaryCards from "@/components/Owners/SummaryCards";

// Import our new modular components
import { BranchesHeader } from "@/components/branches-main/BranchesHeader";
import { BranchesError } from "@/components/branches-main/BranchesError";
import { BranchesFilters } from "@/components/branches-main/BranchesFilters";
import { BranchesTable } from "@/components/branches-main/BranchesTable";
import BranchUsersModal from "@/components/branches-main/BranchUsersModal";
import { useBranchesManagement } from "@/components/branches-main/useBranchesManagement";
import { useEffect, useState } from "react";
import { showRoleAccessNotification } from "@/lib/auth";

const BranchesPage = () => {
  const {
    // Data
    branches,
    isLoading,
    error,
    currentUserEmail,
    searchTerm,

    // Modal states
    showAddManagerModal,
    showRemoveManagerModal,
    showDeleteModal,
    selectedBranch,
    managerEmail,
    selectedManagerEmail,
    isProcessing,

    // Actions
    setSearchTerm,
    fetchBranches,
    handleCreateManager,
    handleLogin,
    handleAddBranch,

    // Modal actions
    setShowAddManagerModal,
    setShowRemoveManagerModal,
    setShowDeleteModal,
    setSelectedBranch,
    setManagerEmail,
    setSelectedManagerEmail,
    handleAddManager,
    handleRemoveManager,
    handleDeleteBranch,
  } = useBranchesManagement();

  // Branch users modal state
  const [showBranchUsersModal, setShowBranchUsersModal] = useState(false);
  const [selectedBranchForUsers, setSelectedBranchForUsers] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // // Show role access notification on page load
  // useEffect(() => {
  //   showRoleAccessNotification("Branch Management");
  // }, []);

  const handleRemoveManagerClick = (branch: any) => {
    setSelectedBranch(branch);
    setShowRemoveManagerModal(true);
  };

  const handleDeleteClick = (branch: any) => {
    setSelectedBranch(branch);
    setShowDeleteModal(true);
  };

  const handleViewUsers = (branchId: string, branchName: string) => {
    setSelectedBranchForUsers({ id: branchId, name: branchName });
    setShowBranchUsersModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <BranchesHeader currentUserEmail={currentUserEmail} />

          {/* Summary Cards */}
          <SummaryCards branches={branches} />

          {/* Error State */}
          <BranchesError error={error} onRetry={fetchBranches} />

          {/* Search and Filters */}
          <BranchesFilters
            searchTerm={searchTerm}
            isLoading={isLoading}
            onSearch={setSearchTerm}
            onRefresh={fetchBranches}
            onAddBranch={handleAddBranch}
          />

          {/* Table */}
          <BranchesTable
            branches={branches}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onCreateManager={handleCreateManager}
            onRemoveManager={handleRemoveManagerClick}
            onLogin={handleLogin}
            onDelete={handleDeleteClick}
            onViewUsers={handleViewUsers}
          />
        </div>

        {/* Modals */}
        {showAddManagerModal && selectedBranch && (
          <AddManagerModal
            isOpen={showAddManagerModal}
            onClose={() => {
              setShowAddManagerModal(false);
              setManagerEmail("");
              setSelectedBranch(null);
            }}
            branch={selectedBranch}
            managerEmail={managerEmail}
            setManagerEmail={setManagerEmail}
            handleAddManager={handleAddManager}
            isProcessing={isProcessing}
          />
        )}

        {showRemoveManagerModal && selectedBranch && (
          <RemoveManagerModal
            isOpen={showRemoveManagerModal}
            onClose={() => {
              setShowRemoveManagerModal(false);
              setSelectedBranch(null);
              setSelectedManagerEmail("");
            }}
            branch={selectedBranch}
            selectedManagerEmail={selectedManagerEmail}
            setSelectedManagerEmail={setSelectedManagerEmail}
            handleRemoveManager={handleRemoveManager}
            isProcessing={isProcessing}
          />
        )}

        {showDeleteModal && selectedBranch && (
          <DeleteBranchModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedBranch(null);
            }}
            branch={selectedBranch}
            handleDeleteBranch={handleDeleteBranch}
            isProcessing={isProcessing}
          />
        )}

        {showBranchUsersModal && selectedBranchForUsers && (
          <BranchUsersModal
            isOpen={showBranchUsersModal}
            onClose={() => {
              setShowBranchUsersModal(false);
              setSelectedBranchForUsers(null);
            }}
            branchId={parseInt(selectedBranchForUsers.id)}
            branchName={selectedBranchForUsers.name}
          />
        )}
      </div>
    </div>
  );
};

// Protect this page for OWNER role (owners manage their branches)
export default withAuth(BranchesPage, {
  requiredRoles: [ROLES.OWNER],
});
