"use client";
import React, { useEffect } from "react";
import { showRoleAccessNotification, hasAnyRole } from "@/lib/auth";
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
    staffMembers,
    showStaffDropdown,
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
  } = useResourceManagement();

  // Show role access notification on page load
  useEffect(() => {
    // showRoleAccessNotification("Resource Management");
  }, []);

  const canAssign = hasAnyRole([ROLES.BRANCH_MANAGER]);

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
              {!canAssign && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    You are viewing resources in read-only mode. Only branch
                    managers can assign resources to staff.
                  </p>
                </div>
              )}

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
                showAssignForm={canAssign ? showAssignForm : null}
                assignFormData={assignForm}
                isLoadingStaff={isLoadingStaff}
                staffMembers={staffMembers}
                showStaffDropdown={showStaffDropdown}
                onAssignClick={canAssign ? openAssignForm : () => {}}
                onDeleteClick={handleDeleteResource}
                onAssignFormChange={setAssignForm}
                onStaffSelect={handleStaffSelect}
                onToggleStaffDropdown={handleToggleStaffDropdown}
                onAssignSubmit={handleAssign}
                onAssignCancel={closeAssignForm}
                canAssign={canAssign}
              />

              {/* Show assign buttons only for branch managers */}
            </div>
          )}

          {/* Assigned Resources Tab */}
          {activeTab === "assigned" && (
            <div className="p-6">
              {!canAssign && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    You are viewing resource assignments in read-only mode. Only
                    branch managers can modify assignments.
                  </p>
                </div>
              )}

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
                onUnassign={canAssign ? handleUnassign : () => {}}
                canUnassign={canAssign}
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
