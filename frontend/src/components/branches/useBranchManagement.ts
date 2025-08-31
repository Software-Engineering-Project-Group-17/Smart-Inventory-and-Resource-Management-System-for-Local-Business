import { useState, useEffect } from "react";
import { Branch, BranchModalState, BranchFilters } from "./types";
import { branchAPI } from "@/lib/api/branchAPI";
import { getUserProfile } from "@/lib/auth";

export const useBranchManagement = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const [filters, setFilters] = useState<BranchFilters>({
    searchTerm: "",
  });

  const [modalState, setModalState] = useState<BranchModalState>({
    showAddManagerModal: false,
    showRemoveManagerModal: false,
    showDeleteModal: false,
    selectedBranch: null,
    managerEmail: "",
    selectedManagerEmail: "",
    isProcessing: false,
  });

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
    branch.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
  );

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, searchTerm }));
  };

  // Handle add manager
  const handleAddManager = async (branchId: string) => {
    if (!modalState.managerEmail || !modalState.managerEmail.includes("@"))
      return;

    setModalState((prev) => ({ ...prev, isProcessing: true }));

    // Simulate API call
    setTimeout(() => {
      setBranches((prev) =>
        prev.map((branch) =>
          branch.id === branchId
            ? {
                ...branch,
                managerCount: branch.managerCount + 1,
                managers: [...branch.managers, modalState.managerEmail],
              }
            : branch
        )
      );

      setModalState((prev) => ({
        ...prev,
        showAddManagerModal: false,
        managerEmail: "",
        selectedBranch: null,
        isProcessing: false,
      }));
    }, 1000);
  };

  // Handle remove manager
  const handleRemoveManager = async (branchId: string) => {
    if (!modalState.selectedManagerEmail) return;

    setModalState((prev) => ({ ...prev, isProcessing: true }));

    // Simulate API call
    setTimeout(() => {
      setBranches((prev) =>
        prev.map((branch) =>
          branch.id === branchId
            ? {
                ...branch,
                managerCount: Math.max(0, branch.managerCount - 1),
                managers: branch.managers.filter(
                  (email) => email !== modalState.selectedManagerEmail
                ),
              }
            : branch
        )
      );

      setModalState((prev) => ({
        ...prev,
        showRemoveManagerModal: false,
        selectedManagerEmail: "",
        selectedBranch: null,
        isProcessing: false,
      }));
    }, 1000);
  };

  // Handle delete branch
  const handleDeleteBranch = async (branchId: string) => {
    setModalState((prev) => ({ ...prev, isProcessing: true }));

    // Simulate API call
    setTimeout(() => {
      setBranches((prev) => prev.filter((branch) => branch.id !== branchId));
      setModalState((prev) => ({
        ...prev,
        showDeleteModal: false,
        selectedBranch: null,
        isProcessing: false,
      }));
    }, 1000);
  };

  // Handle login to branch
  const handleLogin = (branchId: string) => {
    console.log("Login to branch:", branchId);
    // Implement login logic
  };

  // Modal actions
  const openAddManagerModal = (branch: Branch) => {
    setModalState((prev) => ({
      ...prev,
      showAddManagerModal: true,
      selectedBranch: branch,
    }));
  };

  const openRemoveManagerModal = (branch: Branch) => {
    setModalState((prev) => ({
      ...prev,
      showRemoveManagerModal: true,
      selectedBranch: branch,
    }));
  };

  const openDeleteModal = (branch: Branch) => {
    setModalState((prev) => ({
      ...prev,
      showDeleteModal: true,
      selectedBranch: branch,
    }));
  };

  const closeModals = () => {
    setModalState((prev) => ({
      ...prev,
      showAddManagerModal: false,
      showRemoveManagerModal: false,
      showDeleteModal: false,
      selectedBranch: null,
      managerEmail: "",
      selectedManagerEmail: "",
    }));
  };

  const setManagerEmail = (email: string) => {
    setModalState((prev) => ({ ...prev, managerEmail: email }));
  };

  const setSelectedManagerEmail = (email: string) => {
    setModalState((prev) => ({ ...prev, selectedManagerEmail: email }));
  };

  return {
    // Data
    branches: filteredBranches,
    allBranches: branches,
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
  };
};
