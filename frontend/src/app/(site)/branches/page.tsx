"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  RefreshCw,
  UserCheck,
} from "lucide-react";
import ActionButton from "@/components/Owners/ActionButton";
import RemoveManagerModal from "@/components/Owners/RemoveManagerModal";
import DeleteBranchModal from "@/components/Owners/DeleteBranchModal";
import AddManagerModal from "@/components/Owners/AddManagerModal";
import SummaryCards from "@/components/Owners/SummaryCards";
import { withAuth } from "@/hooks/useAuth";
import { branchAPI, BranchResponse } from "@/lib/api/branchAPI";
import { getUserProfile } from "@/lib/auth";

interface Branch {
  id: string;
  name: string;
  managerCount: number;
  staffCount: number;
  managers: string[]; // Added to track manager emails
  location?: string;
  contactNumber?: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

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
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [managerEmail, setManagerEmail] = useState("");
  const [selectedManagerEmail, setSelectedManagerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch branches from the backend
  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user's email
      const userProfile = getUserProfile();
      if (!userProfile?.email) {
        throw new Error("User profile not found. Please log in again.");
      }

      setCurrentUserEmail(userProfile.email);

      // Debug: Check token availability
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken");
      console.log("📊 BRANCHES DEBUG - Current user email:", userProfile.email);
      console.log("🔑 BRANCHES DEBUG - Token available:", !!token);
      console.log("🔑 BRANCHES DEBUG - Token length:", token?.length || 0);
      console.log(
        "🆔 BRANCHES DEBUG - UID available:",
        !!localStorage.getItem("uid")
      );
      console.log(
        "👤 BRANCHES DEBUG - Profile:",
        JSON.stringify(userProfile, null, 2)
      );

      // Fetch branches for the current user
      const response = await branchAPI.getBranchesByOwner(userProfile.email);

      // Transform the backend response to match our interface
      const transformedBranches: Branch[] = response.map((branch) => ({
        id: branch.id.toString(),
        name: branch.name,
        managerCount: branch.manager ? 1 : 0, // For now, assume 1 manager if exists
        staffCount: 0, // This would need to be fetched from staff API
        managers: branch.manager ? [branch.manager.email || "No email"] : [],
        location: branch.location,
        contactNumber: branch.contactNumber,
        description: branch.description,
        status: branch.status,
        createdAt: branch.createdAt,
      }));

      setBranches(transformedBranches);
    } catch (err) {
      console.error("Error fetching branches:", err);
      setError("Failed to load your branches. Please try again.");
      // Fallback to empty array if API fails
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
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
                {currentUserEmail && (
                  <p className="text-sm text-gray-500 mt-1">
                    Showing branches for: {currentUserEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <SummaryCards branches={branches} />

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-600" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">
                  Error Loading Branches
                </p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={fetchBranches}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          )}

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
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  onClick={fetchBranches}
                  disabled={isLoading}
                >
                  <RefreshCw
                    size={20}
                    className={isLoading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-3 text-white rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: "#3674B5" }}
                  onClick={() => router.push("/branches/create")}
                >
                  <Plus size={20} />
                  Add Branch
                </button>
              </div>
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <RefreshCw
                            size={20}
                            className="animate-spin text-gray-400"
                          />
                          <span className="text-gray-500">
                            Loading branches...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBranches.map((branch, index) => (
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
                              icon={UserCheck}
                              label="Create Manager"
                              onClick={() =>
                                router.push(
                                  `/managers/create?branchId=${
                                    branch.id
                                  }&branchName=${encodeURIComponent(
                                    branch.name
                                  )}`
                                )
                              }
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
                    ))
                  )}
                </tbody>
              </table>

              {filteredBranches.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No branches found</p>
                  <p className="text-gray-400">
                    {searchTerm
                      ? "Try adjusting your search criteria"
                      : "Create your first branch to get started"}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => router.push("/branches/create")}
                      className="mt-4 px-4 py-2 text-white rounded-lg transition-colors duration-200"
                      style={{ backgroundColor: "#3674B5" }}
                    >
                      <Plus size={16} className="inline mr-2" />
                      Create First Branch
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

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

// Protect this page for OWNER role (owners manage their branches)
export default withAuth(BranchesPage, {
  requiredRoles: ["OWNER"],
});
