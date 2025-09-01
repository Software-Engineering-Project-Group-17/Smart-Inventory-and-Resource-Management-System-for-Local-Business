"use client";
import React from "react";
import { Check, X } from "lucide-react";
import { ResourceHeader } from "@/components/resources/ResourceHeader";
import { ResourceSummaryCards } from "@/components/resources/ResourceSummaryCards";
import { ResourceTabs } from "@/components/resources/ResourceTabs";
import { ResourceControls } from "@/components/resources/ResourceControls";
import { AddResourceForm } from "@/components/resources/AddResourceForm";
import { ResourceTable } from "@/components/resources/ResourceTable";
import { AssignmentTable } from "@/components/resources/AssignmentTable";
import { useResourceManagement } from "@/components/resources/useResourceManagementAPI";
import { RESOURCE_CONSTANTS } from "@/components/resources/constants";

const ResourceTrackingPage = () => {
  const {
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
    notification,

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ResourceHeader />

        {/* Summary Cards */}
        <ResourceSummaryCards resources={resources} assignments={assignments} />

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <ResourceTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            resourceCount={resources.length}
            assignmentCount={assignments.length}
          />

          {/* All Resources Tab */}
          {activeTab === "available" && (
            <div className="p-6">
              <ResourceControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddResource={openAddResourceForm}
                placeholder={RESOURCE_CONSTANTS.placeholders.searchResources}
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
                onUnassign={handleUnassign}
              />
            </div>
          )}
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 z-50 ${
              notification.type === "success"
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === "success" ? (
                <Check className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceTrackingPage;
