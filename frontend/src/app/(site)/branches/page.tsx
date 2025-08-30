"use client";
import React, { useState } from "react";
import { withAuth } from "@/hooks/useAuth";
import Navbar from "@/components/ui/navbar";
import {
  Plus,
  UserMinus,
  LogIn,
  Trash2,
  Users,
  User,
  Building2,
  Search,
  Filter,
  MoreHorizontal,
  X,
  Check,
  Mail,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import ActionButton from "@/components/Owners/ActionButton";
import RemoveManagerModal from "@/components/Owners/RemoveManagerModal";
import DeleteBranchModal from "@/components/Owners/DeleteBranchModal";
import AddManagerModal from "@/components/Owners/AddManagerModal";
import AddBranchModal from "@/components/Owners/AddBranchModal";
import SummaryCards from "@/components/Owners/SummaryCards";

interface Branch {
  id: string;
  name: string;
  managerCount: number;
  staffCount: number;
  managers: string[]; // Added to track manager emails
}

const BranchesPage = () => {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: "1",
      name: "Downtown Branch",
      managerCount: 2,
      staffCount: 8,
      managers: ["john.doe@company.com", "jane.smith@company.com"],
    },
    {
      id: "2",
      name: "Westside Branch",
      managerCount: 1,
      staffCount: 5,
      managers: ["mike.wilson@company.com"],
    },
    {
      id: "3",
      name: "North Plaza",
      managerCount: 3,
      staffCount: 12,
      managers: [
        "sarah.davis@company.com",
        "tom.brown@company.com",
        "lisa.garcia@company.com",
      ],
    },
    {
      id: "4",
      name: "City Center",
      managerCount: 1,
      staffCount: 6,
      managers: ["david.martinez@company.com"],
    },
    {
      id: "5",
      name: "Riverside Branch",
      managerCount: 2,
      staffCount: 9,
      managers: ["amy.johnson@company.com", "robert.lee@company.com"],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [showRemoveManagerModal, setShowRemoveManagerModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [managerEmail, setManagerEmail] = useState("");
  const [selectedManagerEmail, setSelectedManagerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [isProcessingAddBranch, setIsProcessingAddBranch] = useState(false);

  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddManager = async (branchId: string) => {
    if (!managerEmail || !managerEmail.includes("@")) return;

    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setBranches((prev) =>
        prev.map((branch) =>
          branch.id === branchId
            ? {
                ...branch,
                managerCount: branch.managerCount + 1,
                managers: [...branch.managers, managerEmail],
              }
            : branch
        )
      );
      setShowAddManagerModal(false);
      setManagerEmail("");
      setSelectedBranch(null);
      setIsProcessing(false);
    }, 1000);
  };

  const handleRemoveManager = async (branchId: string) => {
    if (!selectedManagerEmail) return;

    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setBranches((prev) =>
        prev.map((branch) =>
          branch.id === branchId
            ? {
                ...branch,
                managerCount: Math.max(0, branch.managerCount - 1),
                managers: branch.managers.filter(
                  (email) => email !== selectedManagerEmail
                ),
              }
            : branch
        )
      );
      setShowRemoveManagerModal(false);
      setSelectedManagerEmail("");
      setSelectedBranch(null);
      setIsProcessing(false);
    }, 1000);
  };

  const handleDeleteBranch = async (branchId: string) => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setBranches((prev) => prev.filter((branch) => branch.id !== branchId));
      setShowDeleteModal(false);
      setSelectedBranch(null);
      setIsProcessing(false);
    }, 1000);
  };

  const handleLogin = (branchId: string) => {
    console.log("Login to branch:", branchId);
    // Implement login logic
  };

  // Add Branch function - Fixed to actually add the branch
  const handleAddBranch = async () => {
    if (!branchName.trim()) return;

    setIsProcessingAddBranch(true);
    // Simulate API call
    setTimeout(() => {
      const newBranch: Branch = {
        id: (branches.length + 1).toString(),
        name: branchName.trim(),
        managerCount: 0,
        staffCount: 0,
        managers: [],
      };

      setBranches((prev) => [...prev, newBranch]);
      setShowAddBranchModal(false);
      setBranchName("");
      setIsProcessingAddBranch(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-3 rounded-xl text-white"
                style={{ backgroundColor: "#3674B5" }}
              >
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Branches</h1>
                <p className="text-gray-600">
                  Manage your branch locations and staff
                </p>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <SummaryCards branches={branches} />

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search branches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none"
                />
              </div>
              <button
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                onClick={() => setShowAddBranchModal(true)}
              >
                <Plus size={20} />
                Add Branch
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "#3674B5" }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Branch Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Employee Count
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBranches.map((branch, index) => (
                    <tr
                      key={branch.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                            style={{ backgroundColor: "#FADA7A" }}
                          >
                            {branch.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {branch.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Branch #{branch.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Managers:{" "}
                              <span className="font-semibold text-gray-900">
                                {branch.managerCount}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Staff:{" "}
                              <span className="font-semibold text-gray-900">
                                {branch.staffCount}
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2 justify-center">
                          <ActionButton
                            icon={UserPlus}
                            label="Add Manager"
                            onClick={() => {
                              setSelectedBranch(branch);
                              setShowAddManagerModal(true);
                            }}
                            variant="primary"
                          />
                          <ActionButton
                            icon={UserMinus}
                            label="Remove Manager"
                            onClick={() => {
                              setSelectedBranch(branch);
                              setShowRemoveManagerModal(true);
                            }}
                            disabled={branch.managerCount === 0}
                          />
                          <ActionButton
                            icon={LogIn}
                            label="Login"
                            onClick={() => handleLogin(branch.id)}
                          />
                          <ActionButton
                            icon={Trash2}
                            label="Delete"
                            onClick={() => {
                              setSelectedBranch(branch);
                              setShowDeleteModal(true);
                            }}
                            variant="danger"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBranches.length === 0 && (
                <div className="text-center py-12">
                  <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No branches found</p>
                  <p className="text-gray-400">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Branch Modal - MOVED INSIDE RETURN STATEMENT */}
        <AddBranchModal
          isOpen={showAddBranchModal}
          onClose={() => {
            setShowAddBranchModal(false);
            setBranchName("");
          }}
          branchName={branchName}
          setBranchName={setBranchName}
          handleAddBranch={handleAddBranch}
          isProcessing={isProcessingAddBranch}
        />

        {/* Add Manager Modal */}
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

        {/* Remove Manager Modal */}
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

        {/* Delete Branch Modal */}
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
      </div>
    </div>
  );
};

// Protect this page for MANAGER and higher roles
export default withAuth(BranchesPage, {
  requiredRoles: ["MANAGER", "OWNER", "ADMIN"],
});
