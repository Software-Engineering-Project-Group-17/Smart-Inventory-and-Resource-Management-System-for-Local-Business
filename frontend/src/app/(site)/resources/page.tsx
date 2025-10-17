"use client";
import React, { useEffect } from "react";
import { showRoleAccessNotification } from "@/lib/auth";
import { ResourceHeader } from "@/components/resources/ResourceHeader";
import { ResourceSummaryCards } from "@/components/resources/ResourceSummaryCards";
import { ResourceTabs } from "@/components/resources/ResourceTabs";
import { ResourceControls } from "@/components/resources/ResourceControls";
import { AddResourceForm } from "@/components/resources/AddResourceForm";
import { ResourceTable } from "@/components/resources/ResourceTable";
import { AssignmentTable } from "@/components/resources/AssignmentTable";
import { useResourceManagement } from "@/components/resources/useResourceManagementAPI";
import { RESOURCE_CONSTANTS } from "@/components/resources/constants";
import { withAuth } from "@/hooks/useAuth";
import { ROLES } from "@/lib/roles";

const ResourceTrackingPage = () => {
  const {
    // State
    activeTab,
    showAssignForm,
    showAddResourceForm,
    searchQuery,
    isLoadingStaff,
    isLoading,
    resources,
    assignments,
    assignForm,
    addResourceForm,

    // Computed
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
  } = useResourceManagement();

  // Show role access notification on page load
  useEffect(() => {
    // showRoleAccessNotification("Resource Management");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ResourceHeader />

        {/* Summary Cards */}
        <ResourceSummaryCards
          resources={resources}
          assignments={assignments}
          isLoading={isLoading}
        />

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <ResourceTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            resourceCount={resources.length}
            assignmentCount={assignments.length}
            isLoading={isLoading}
          />

          {/* All Resources Tab */}
          {activeTab === "available" && (
            <div className="p-6">
              <ResourceControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddResource={openAddResourceForm}
                placeholder={RESOURCE_CONSTANTS.placeholders.searchResources}
                isLoading={isLoading}
              />

              <AddResourceForm
                isOpen={showAddResourceForm}
                formData={addResourceForm}
                onChange={setAddResourceForm}
                onSubmit={handleAddResource}
                onCancel={closeAddResourceForm}
              />

              <ResourceTable
                resources={filteredResources}
                isLoading={isLoading}
                showAssignForm={showAssignForm}
                assignFormData={assignForm}
                isLoadingStaff={isLoadingStaff}
                onAssignClick={openAssignForm}
                onDeleteClick={handleDeleteResource}
                onAssignFormChange={setAssignForm}
                onEmailChange={handleEmailChange}
                onAssignSubmit={handleAssign}
                onAssignCancel={closeAssignForm}
              />
            </div>
          )}

          {/* Assigned Resources Tab */}
          {activeTab === "assigned" && (
            <div className="p-6">
              <ResourceControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddResource={openAddResourceForm}
                placeholder={RESOURCE_CONSTANTS.placeholders.searchAssignments}
                isLoading={isLoading}
              />

              <AddResourceForm
                isOpen={showAddResourceForm}
                formData={addResourceForm}
                onChange={setAddResourceForm}
                onSubmit={handleAddResource}
                onCancel={closeAddResourceForm}
              />

              <AssignmentTable
                assignments={filteredAssignments}
                isLoading={isLoading}
                onUnassign={handleUnassign}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(ResourceTrackingPage, {
  requiredRoles: [ROLES.STAFF, ROLES.BRANCH_MANAGER],
});
