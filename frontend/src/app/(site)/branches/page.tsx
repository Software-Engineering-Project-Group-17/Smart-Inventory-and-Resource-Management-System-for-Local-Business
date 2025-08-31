"use client";
import React, { useState } from "react";
import PageHeader from "@/components/branch/Header";
import SearchBar from "@/components/branch/SearchBar";
import BranchesTable from "@/components/branch/BranchesTable";
import SummaryCards from "@/components/branch/SummaryCard";
import AddBranchModal from "@/components/branch/AddBranchModal";
import AddManagerModal from "@/components/branch/AddManagerModal";
import RemoveManagerModal from "@/components/branch/RemoveManagerModal";
import DeleteBranchModal from "@/components/branch/DeleteBranchModal";
import { Branch } from "@/types/branches";


const BranchesPage = () => {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [showRemoveManagerModal, setShowRemoveManagerModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);


  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddManager = (branchId: string, email: string) => {
    setBranches((prev) =>
      prev.map((branch) =>
        branch.id === branchId
          ? {
              ...branch,
              managerCount: branch.managerCount + 1,
              managers: [...branch.managers, email],
            }
          : branch
      )
    );
  };

  const handleRemoveManager = (branchId: string, email: string) => {
    setBranches((prev) =>
      prev.map((branch) =>
        branch.id === branchId
          ? {
              ...branch,
              managerCount: Math.max(0, branch.managerCount - 1),
              managers: branch.managers.filter(
                (managerEmail) => managerEmail !== email
              ),
            }
          : branch
      )
    );
  };

  const handleDeleteBranch = (branchId: string) => {
    setBranches((prev) => prev.filter((branch) => branch.id !== branchId));
  };

  const handleLogin = (branchId: string) => {
    console.log("Login to branch:", branchId);
    // Implement login logic
  };

  const handleAddBranch = (newBranch: Branch) => {
    setBranches(prev => [...prev, newBranch]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader />

        <SummaryCards branches={branches} />
        
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddBranch={() => setShowAddBranchModal(true)}
        />

        <BranchesTable
          branches={filteredBranches}
          onAddManager={(branch) => {
            setSelectedBranch(branch);
            setShowAddManagerModal(true);
          }}
          onRemoveManager={(branch) => {
            setSelectedBranch(branch);
            setShowRemoveManagerModal(true);
          }}
          onLogin={handleLogin}
          onDeleteBranch={(branch) => {
            setSelectedBranch(branch);
            setShowDeleteModal(true);
          }}
        />

        {/* Modals */}
        <AddBranchModal
          isOpen={showAddBranchModal}
          onClose={() => setShowAddBranchModal(false)}
          onAddBranch={handleAddBranch}
          branches={branches}
        />

        <AddManagerModal
          isOpen={showAddManagerModal}
          onClose={() => {
            setShowAddManagerModal(false);
            setSelectedBranch(null);
          }}
          selectedBranch={selectedBranch}
          onAddManager={handleAddManager}
        />

        <RemoveManagerModal
          isOpen={showRemoveManagerModal}
          onClose={() => {
            setShowRemoveManagerModal(false);
            setSelectedBranch(null);
          }}
          selectedBranch={selectedBranch}
          onRemoveManager={handleRemoveManager}
        />

        <DeleteBranchModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedBranch(null);
          }}
          selectedBranch={selectedBranch}
          onDeleteBranch={handleDeleteBranch}
        />

      </div>
    </div>
  );
};


// Protect this page for OWNER role (owners manage their branches)
export default withAuth(BranchesPage, {
  requiredRoles: ["OWNER"],
});

