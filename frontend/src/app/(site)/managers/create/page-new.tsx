"use client";
import React from "react";
import { AlertCircle } from "lucide-react";
import { withAuth } from "@/hooks/useAuth";

// Import modular components
import { CreateManagerHeader } from "@/components/managers/ManagerHeader";
import { CreateManagerStatus } from "@/components/managers/ManagerStatus";
import { BranchInfo } from "@/components/managers/BranchInfo";
import { CreateManagerForm } from "@/components/managers/ManagerForm";
import { CreateManagerActions } from "@/components/managers/ManagerActions";
import { ManagerInformation } from "@/components/managers/ManagerInformation";
import { useCreateManager } from "@/components/managers/useCreateManager";
import { MANAGER_CONSTANTS } from "@/components/managers/managerConstants";

const CreateManagerPage = () => {
  const {
    // Data
    branchId,
    branchName,
    formData,
    errors,
    isSubmitting,
    submitStatus,
    showPassword,
    showConfirmPassword,
    currentUserEmail,

    // Actions
    handleInputChange,
    handleSubmit,
    handleCancel,
    generateRandomPassword,
    togglePassword,
    toggleConfirmPassword,
  } = useCreateManager();

  // Loading/Error state for invalid parameters
  if (!branchId || !branchName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {MANAGER_CONSTANTS.messages.invalidParams}
          </h2>
          <p className="text-gray-600">
            {MANAGER_CONSTANTS.messages.branchMissing}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <CreateManagerHeader
            branchName={branchName}
            currentUserEmail={currentUserEmail}
            onBack={handleCancel}
          />

          {/* Status Messages */}
          <CreateManagerStatus status={submitStatus} />

          {/* Branch Info Card */}
          <BranchInfo branchId={branchId} branchName={branchName} />

          {/* Main Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Form Fields */}
              <CreateManagerForm
                formData={formData}
                errors={errors}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                onInputChange={handleInputChange}
                onTogglePassword={togglePassword}
                onToggleConfirmPassword={toggleConfirmPassword}
                onGeneratePassword={generateRandomPassword}
              />

              {/* Action Buttons */}
              <CreateManagerActions
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
                onSubmit={handleSubmit}
              />
            </form>
          </div>

          {/* Information Card */}
          <ManagerInformation />
        </div>
      </div>
    </div>
  );
};

// Protect this page for OWNER role only
export default withAuth(CreateManagerPage, {
  requiredRoles: ["OWNER"],
});
