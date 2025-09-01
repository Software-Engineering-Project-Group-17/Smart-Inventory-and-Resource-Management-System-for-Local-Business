import { useState, useEffect } from "react";
import {
  Resource,
  Assignment,
  StaffMember,
  AssignmentFormData,
  ResourceFormData,
  TabType,
} from "./types";
import { RESOURCE_CONSTANTS } from "./constants";

export const useResourceManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>("available");
  const [showAssignForm, setShowAssignForm] = useState<number | null>(null);
  const [showAddResourceForm, setShowAddResourceForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  const [resources, setResources] = useState<Resource[]>(
    RESOURCE_CONSTANTS.sampleResources
  );

  const [assignments, setAssignments] = useState<Assignment[]>(
    RESOURCE_CONSTANTS.sampleAssignments
  );

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

  // Computed values
  const availableResources = resources.filter(
    (resource) => resource.isAvailable
  );

  const filteredResources = resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.details.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Staff lookup simulation
  const fetchStaffDetails = async (email: string) => {
    if (!email || !email.includes("@")) return;

    setIsLoadingStaff(true);

    // Simulate API call delay
    setTimeout(() => {
      const staffMember = RESOURCE_CONSTANTS.mockStaffDatabase.find(
        (staff) => staff.email.toLowerCase() === email.toLowerCase()
      );

      if (staffMember) {
        setAssignForm((prev) => ({
          ...prev,
          staffName: staffMember.name,
          phone: staffMember.phone,
        }));
      } else {
        setAssignForm((prev) => ({
          ...prev,
          staffName: "",
          phone: "",
        }));
      }
      setIsLoadingStaff(false);
    }, 800);
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

  // Resource operations
  const handleAddResource = () => {
    if (addResourceForm.name && addResourceForm.details) {
      const newResource: Resource = {
        id: Math.max(...resources.map((r) => r.id), 0) + 1,
        name: addResourceForm.name,
        details: addResourceForm.details,
        isAvailable: true,
      };

      setResources((prev) => [...prev, newResource]);
      resetAddResourceForm();
      setShowAddResourceForm(false);

      alert(RESOURCE_CONSTANTS.messages.resourceAdded);
    }
  };

  const handleAssign = (resourceId: number) => {
    if (
      assignForm.email &&
      assignForm.purpose &&
      assignForm.startDate &&
      assignForm.endDate
    ) {
      const resource = resources.find((r) => r.id === resourceId);
      if (resource) {
        const newAssignment: Assignment = {
          id: Math.max(...assignments.map((a) => a.id), 0) + 1,
          resourceId,
          resourceName: resource.name,
          ...assignForm,
        };
        setAssignments((prev) => [...prev, newAssignment]);

        // Update resource availability
        setResources((prev) =>
          prev.map((r) =>
            r.id === resourceId ? { ...r, isAvailable: false } : r
          )
        );

        alert(`${resource.name} has been assigned to ${assignForm.email}`);

        resetAssignForm();
        setShowAssignForm(null);
      }
    }
  };

  const handleUnassign = (assignmentId: number) => {
    if (confirm(RESOURCE_CONSTANTS.messages.confirmUnassign)) {
      const assignment = assignments.find((a) => a.id === assignmentId);
      if (assignment) {
        // Update resource availability
        setResources((prev) =>
          prev.map((r) =>
            r.id === assignment.resourceId ? { ...r, isAvailable: true } : r
          )
        );

        // Remove assignment
        setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      }
    }
  };

  const handleDeleteResource = (resourceId: number) => {
    if (confirm(RESOURCE_CONSTANTS.messages.confirmDelete)) {
      // Remove any existing assignments for this resource
      setAssignments((prev) => prev.filter((a) => a.resourceId !== resourceId));

      // Remove the resource
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
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
    resources,
    assignments,
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
    handleEmailChange,
    handleAddResource,
    handleAssign,
    handleUnassign,
    handleDeleteResource,
    openAssignForm,
    closeAssignForm,
    openAddResourceForm,
    closeAddResourceForm,
  };
};
