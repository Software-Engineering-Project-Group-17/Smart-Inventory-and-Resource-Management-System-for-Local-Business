import { useState, useEffect } from "react";
import {
  Resource,
  Assignment,
  AssignmentFormData,
  ResourceFormData,
  TabType,
} from "./types";
import { resourceApi, assignmentApi, staffApi } from "@/lib/api/resources";
import { toastUtils } from "@/lib/toast-utils";

interface StaffMember {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export const useResourceManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>("available");
  const [showAssignForm, setShowAssignForm] = useState<number | null>(null);
  const [showAddResourceForm, setShowAddResourceForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);

  const [assignForm, setAssignForm] = useState<AssignmentFormData>({
    staffId: undefined,
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

  // Load resources, assignments, and staff on component mount
  useEffect(() => {
    loadResources();
    loadStaffMembers();
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
        const errorMessage = response.message || "Failed to load resources";
        setError(errorMessage);
        toastUtils.dataError("load resources", errorMessage);
        console.error("Failed to load resources:", response.error);
      }
    } catch (error) {
      console.error("Error loading resources:", error);
      const errorMessage = "Failed to load resources";
      setError(errorMessage);
      toastUtils.networkError();
    } finally {
      setIsLoading(false);
    }
  };

  // Load staff members for the current branch
  const loadStaffMembers = async () => {
    try {
      console.log("Loading staff members for assignment dropdown...");
      const response = await staffApi.getAll();

      if (response.success && response.data) {
        // Transform the staff data to match our interface
        const staffList = response.data.map((staff: any) => ({
          id: staff.id,
          email: staff.email,
          firstName: staff.firstName || staff.first_name || "",
          lastName: staff.lastName || staff.last_name || "",
          phone: staff.phone || staff.tel || staff.phoneNumber || "",
        }));

        setStaffMembers(staffList);
        console.log("Staff members loaded:", staffList);
      } else {
        console.error("Failed to load staff members:", response.message);
      }
    } catch (error) {
      console.error("Error loading staff members:", error);
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
    console.log("Fetching staff details for email:", email);

    try {
      const response = await staffApi.getByEmail(email);
      console.log("Staff API response:", response);

      if (response.success && response.data) {
        const staff = response.data;
        console.log("Staff data received:", staff);

        const newFormData = {
          staffName:
            staff.name ||
            `${staff.first_name || ""} ${staff.last_name || ""}`.trim(),
          phone: staff.phone || staff.tel || "",
        };

        console.log("Setting form data:", newFormData);

        setAssignForm((prev) => ({
          ...prev,
          ...newFormData,
        }));

        console.log("Staff details loaded successfully:", {
          name: staff.name,
          email: staff.email,
          phone: staff.phone || staff.tel,
          branch: staff.branchName || staff.branch_name,
          types: staff.staff_types,
        });
      } else {
        console.log("Staff not found for email:", email, "Response:", response);
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
  const handleStaffSelect = (staff: StaffMember) => {
    setAssignForm((prev) => ({
      ...prev,
      staffId: staff.id,
      email: staff.email,
      staffName: `${staff.firstName} ${staff.lastName}`.trim(),
      phone: staff.phone,
    }));
    setShowStaffDropdown(false);
  };

  const handleToggleStaffDropdown = () => {
    setShowStaffDropdown(!showStaffDropdown);
  };

  const resetAssignForm = () => {
    setAssignForm({
      staffId: undefined,
      email: "",
      staffName: "",
      phone: "",
      purpose: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    });
    setShowStaffDropdown(false);
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
      toastUtils.validationError("Please fill in all required fields");
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
        toastUtils.formSuccess("Created", addResourceForm.name);
        resetAddResourceForm();
        setShowAddResourceForm(false);
        // Reload resources
        await loadResources();
      } else {
        toastUtils.formError(
          "Create Resource",
          response.message || "Failed to add resource"
        );
      }
    } catch (error) {
      console.error("Error adding resource:", error);
      toastUtils.formError("Create Resource", "Failed to add resource");
    }
  };

  const handleAssign = async (resourceId: number) => {
    if (
      !assignForm.email ||
      !assignForm.purpose ||
      !assignForm.startDate ||
      !assignForm.endDate
    ) {
      toastUtils.validationError("Please fill in all required fields");
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
        toastUtils.success(
          "Resource Assigned",
          `Resource assigned to ${assignForm.staffName} successfully`
        );
        resetAssignForm();
        setShowAssignForm(null);
        // Reload resources
        await loadResources();
      } else {
        toastUtils.error(
          "Assignment Failed",
          response.message || "Failed to assign resource"
        );
      }
    } catch (error) {
      console.error("Error assigning resource:", error);
      toastUtils.error("Assignment Failed", "Failed to assign resource");
    }
  };

  const handleUnassign = async (assignmentId: number) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    const resourceName = assignment?.resourceName || "Resource";

    if (!confirm(`Are you sure you want to unassign ${resourceName}?`)) {
      return;
    }

    try {
      const response = await assignmentApi.delete(assignmentId);

      if (response.success) {
        toastUtils.actionWithUndo(
          `${resourceName} unassigned successfully`,
          "Undo",
          () => {
            // If undo functionality is needed, implement it here
            toastUtils.info("Undo", "Please reassign the resource manually");
          }
        );
        // Reload resources
        await loadResources();
      } else {
        toastUtils.error(
          "Unassignment Failed",
          response.message || "Failed to unassign resource"
        );
      }
    } catch (error) {
      console.error("Error unassigning resource:", error);
      toastUtils.error("Unassignment Failed", "Failed to unassign resource");
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    const resource = resources.find((r) => r.id === resourceId);
    const resourceName = resource?.name || "Resource";

    if (
      !confirm(
        `Are you sure you want to delete "${resourceName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await resourceApi.delete(resourceId);

      if (response.success) {
        toastUtils.success(
          "Resource Deleted",
          `"${resourceName}" has been deleted successfully`
        );
        // Reload resources
        await loadResources();
      } else {
        toastUtils.error(
          "Delete Failed",
          response.message || "Failed to delete resource"
        );
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      toastUtils.error("Delete Failed", "Failed to delete resource");
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
    staffMembers,
    showStaffDropdown,
    assignForm,
    addResourceForm,

    // Computed
    availableResources,
    filteredResources,
    filteredAssignments,

    // Actions
    setActiveTab,
    setSearchQuery,
    setAssignForm,
    setAddResourceForm,
    handleStaffSelect,
    handleToggleStaffDropdown,
    handleAddResource,
    handleAssign,
    handleUnassign,
    handleDeleteResource,
    openAssignForm,
    closeAssignForm,
    openAddResourceForm,
    closeAddResourceForm,
    loadResources,
  };
};
