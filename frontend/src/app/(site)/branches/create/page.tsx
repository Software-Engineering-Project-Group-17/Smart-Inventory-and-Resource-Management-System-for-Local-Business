"use client";
import React from "react";
import { withAuth } from "@/hooks/useAuth";

// Import our modular components
import { CreateBranchHeader } from "@/components/branches/CreateBranchHeader";
import { CreateBranchStatus } from "@/components/branches/CreateBranchStatus";
import { CreateBranchForm } from "@/components/branches/CreateBranchForm";
import { CreateBranchActions } from "@/components/branches/CreateBranchActions";
import { CreateBranchTips } from "@/components/branches/CreateBranchTips";
import { useCreateBranch } from "@/components/branches/useCreateBranch";
import { CREATE_BRANCH_CONSTANTS } from "@/components/branches/createConstants";

const CreateBranchPage = () => {
  const {
    // Form data
    formData,
    errors,
    isSubmitting,
    submitStatus,
    
    // Actions
    handleInputChange,
    handleSubmit,
    handleCancel,
  } = useCreateBranch();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <CreateBranchHeader onBack={handleCancel} />

          {/* Status Notification */}
          <CreateBranchStatus status={submitStatus} />

          {/* Main Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {CREATE_BRANCH_CONSTANTS.labels.branchDetails}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Form Fields */}
              <CreateBranchForm
                formData={formData}
                errors={errors}
                onInputChange={handleInputChange}
              />

              {/* Action Buttons */}
              <CreateBranchActions
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
              />
            </form>
          </div>

          {/* Tips Card */}
          <CreateBranchTips />
        </div>
      </div>
    </div>
  );
};

// Protect this page for OWNER role only (since only owners can create branches)
export default withAuth(CreateBranchPage, {
  requiredRoles: ["OWNER"],
});
