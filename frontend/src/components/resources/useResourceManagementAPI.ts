import { useState, useEffect } from "react";
import {
  Resource,
  Assignment,
  AssignmentFormData,
  ResourceFormData,
  TabType,
} from "./types";
import { resourceApi, assignmentApi, staffApi } from "@/lib/api/resources-authenticated";

export const useResourceManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>("available");
  const [showAssignForm, setShowAssignForm] = useState<number | null>(null);
  const [showAddResourceForm, setShowAddResourceForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Show notification function
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 5000); // Hide after 5 seconds
  };

  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [assignForm, setAssignForm] = useState<AssignmentFormData>({
    email: "",
    staffName: "",
    phone: "",
    purpose: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });

  const [addResourceForm, setAddResourceForm] = useState<ResourceFormData>({
    name: "",
    details: "",
  });

  // Load resources and assignments on component mount
  useEffect(() => {
    loadResources();
  }, []);

  // Load resources from API
  const loadResources = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await resourceApi.getAll();

      if (response.success && response.data) {
        setResources(response.data.resources);
        setAssignments(response.data.assignments);
      } else {
        setError(response.message || "Failed to load resources");
        console.error("Failed to load resources:", response.error);
      }
    } catch (error) {
      console.error("Error loading resources:", error);
      setError("Failed to load resources");
    } finally {
      setIsLoading(false);
    }
  };

  // Computed values
  const availableResources = resources.filter(
    (resource) => resource.isAvailable
  );

  const filteredResources = resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.details &&
        resource.details.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.resourceName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      assignment.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Staff lookup with API
  const fetchStaffDetails = async (email: string) => {
    if (!email || !email.includes("@")) return;

    setIsLoadingStaff(true);

    try {
      const response = await staffApi.findByEmail(email);

      if (response.success && response.data) {
        setAssignForm((prev) => ({
          ...prev,
          staffName: response.data!.name,
          phone: response.data!.phone,
        }));
      } else {
        // Clear fields if staff not found
        setAssignForm((prev) => ({
          ...prev,
          staffName: "",
          phone: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching staff details:", error);
      setAssignForm((prev) => ({
        ...prev,
        staffName: "",
        phone: "",
      }));
    } finally {
      setIsLoadingStaff(false);
    }
  };

  // Form handlers
  const handleEmailChange = (email: string) => {
    setAssignForm((prev) => ({ ...prev, email }));
    fetchStaffDetails(email);
  };

  const resetAssignForm = () => {
    setAssignForm({
      email: "",
      staffName: "",
      phone: "",
      purpose: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    });
  };

  const resetAddResourceForm = () => {
    setAddResourceForm({
      name: "",
      details: "",
    });
  };

  // Resource operations with API
  const handleAddResource = async () => {
    if (!addResourceForm.name || !addResourceForm.details) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      // Branch ID and creator will be automatically captured from user authentication
      const response = await resourceApi.create({
        name: addResourceForm.name,
        details: addResourceForm.details,
        resourceType: "GENERAL",
      });

      if (response.success) {
        showNotification("Resource added successfully!", "success");
        resetAddResourceForm();
        setShowAddResourceForm(false);
        // Reload resources
        await loadResources();
      } else {
        showNotification(response.message || "Failed to add resource", "error");
      }
    } catch (error) {
      console.error("Error adding resource:", error);
      showNotification("Failed to add resource", "error");
    }
  };

  const handleAssign = async (resourceId: number) => {
    if (
      !assignForm.email ||
      !assignForm.purpose ||
      !assignForm.startDate ||
      !assignForm.endDate
    ) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      const response = await assignmentApi.create({
        resourceId,
        staffEmail: assignForm.email,
        purpose: assignForm.purpose,
        startDate: assignForm.startDate,
        endDate: assignForm.endDate,
        startTime: assignForm.startTime,
        endTime: assignForm.endTime,
      });

      if (response.success) {
        showNotification("Resource assigned successfully!", "success");
        resetAssignForm();
        setShowAssignForm(null);
        // Reload resources
        await loadResources();
      } else {
        showNotification(
          response.message || "Failed to assign resource",
          "error"
        );
      }
    } catch (error) {
      console.error("Error assigning resource:", error);
      showNotification("Failed to assign resource", "error");
    }
  };

  const handleUnassign = async (assignmentId: number) => {
    if (!confirm("Are you sure you want to unassign this resource?")) {
      return;
    }

    try {
      const response = await assignmentApi.delete(assignmentId);

      if (response.success) {
        showNotification("Resource unassigned successfully!", "success");
        // Reload resources
        await loadResources();
      } else {
        showNotification(
          response.message || "Failed to unassign resource",
          "error"
        );
      }
    } catch (error) {
      console.error("Error unassigning resource:", error);
      showNotification("Failed to unassign resource", "error");
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      const response = await resourceApi.delete(resourceId);

      if (response.success) {
        showNotification("Resource deleted successfully!", "success");
        // Reload resources
        await loadResources();
      } else {
        showNotification(
          response.message || "Failed to delete resource",
          "error"
        );
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      showNotification("Failed to delete resource", "error");
    }
  };

  // Modal and form controls
  const openAssignForm = (resourceId: number) => {
    setShowAssignForm(showAssignForm === resourceId ? null : resourceId);
  };

  const closeAssignForm = () => {
    setShowAssignForm(null);
    resetAssignForm();
  };

  const openAddResourceForm = () => {
    setShowAddResourceForm(!showAddResourceForm);
  };

  const closeAddResourceForm = () => {
    setShowAddResourceForm(false);
    resetAddResourceForm();
  };

  return {
    // State
    activeTab,
    showAssignForm,
    showAddResourceForm,
    searchQuery,
    isLoadingStaff,
    isLoading,
    error,
    resources,
    assignments,
    assignForm,
    addResourceForm,
    notification,

    // Computed
    availableResources,
    filteredResources,
    filteredAssignments,

    // Actions
    setActiveTab,
    setSearchQuery,
    setAssignForm,
    setAddResourceForm,
    handleEmailChange,
    handleAddResource,
    handleAssign,
    handleUnassign,
    handleDeleteResource,
    openAssignForm,
    closeAssignForm,
    openAddResourceForm,
    closeAddResourceForm,
    loadResources,
    showNotification,
  };
};
