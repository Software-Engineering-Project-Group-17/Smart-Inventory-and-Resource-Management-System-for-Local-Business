"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { branchAPI } from "@/lib/api/branchAPI";
import { getUserProfile } from "@/lib/auth";
import { Branch } from "./types";

export const useBranchesManagement = () => {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
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

      // Debug logging
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken");
      console.log("📊 BRANCHES DEBUG - Current user email:", userProfile.email);
      console.log("🔑 BRANCHES DEBUG - Token available:", !!token);

      // Fetch branches for the current user
      const response = await branchAPI.getBranchesByOwner(userProfile.email);

      // Transform the backend response to match our interface
      const transformedBranches: Branch[] = response.map((branch) => ({
        id: branch.id.toString(),
        name: branch.name,
        managerCount: branch.manager ? 1 : 0,
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
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Filter branches based on search term
  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manager operations (mock implementations)
  const handleAddManager = async (branchId: string) => {
    if (!managerEmail || !managerEmail.includes("@")) return;

    setIsProcessing(true);
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
    setTimeout(() => {
      setBranches((prev) => prev.filter((branch) => branch.id !== branchId));
      setShowDeleteModal(false);
      setSelectedBranch(null);
      setIsProcessing(false);
    }, 1000);
  };

  // Navigation functions
  const handleCreateManager = (branchId: string, branchName: string) => {
    router.push(
      `/managers/create?branchId=${branchId}&branchName=${encodeURIComponent(
        branchName
      )}`
    );
  };

  const handleLogin = (branchId: string) => {
    console.log("Login to branch:", branchId);
    // Implement login logic
  };

  const handleAddBranch = () => {
    router.push("/branches/create");
  };

  return {
    // Data
    branches: filteredBranches,
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
  };
};
