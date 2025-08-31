"use client";
import React from "react";
import { AlertCircle } from "lucide-react";
import { withAuth } from "@/hooks/useAuth";

// Import our modular components
import { CreateManagerHeader } from "@/components/managers/CreateManagerHeader";
import { StatusNotification } from "@/components/managers/StatusNotification";
import { ManagerFormFields } from "@/components/managers/ManagerFormFields";
import { FormActions } from "@/components/managers/FormActions";
import { InformationCard } from "@/components/managers/InformationCard";
import { useManagerForm } from "@/components/managers/useManagerForm";
import { MANAGER_CONSTANTS } from "@/components/managers/constants";

const CreateManagerPage = () => {
  const {
    // Form data
    formData,
    errors,
    isSubmitting,
    submitStatus,
    currentUserEmail,
    passwordVisibility,

    // Branch info
    branchId,
    branchName,

    // Actions
    handleInputChange,
    handleSubmit,
    handleCancel,
    generateRandomPassword,
    togglePasswordVisibility,
  } = useManagerForm();

  // Show error if required parameters are missing
  if (!branchId || !branchName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {MANAGER_CONSTANTS.messages.invalidParams}
          </h2>
          <p className="text-gray-600">
            {MANAGER_CONSTANTS.messages.invalidParamsDesc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <CreateManagerHeader
            branchName={branchName}
            currentUserEmail={currentUserEmail}
            onBack={handleCancel}
          />

          {/* Status Notification */}
          <StatusNotification status={submitStatus} />

          {/* Main Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {MANAGER_CONSTANTS.labels.managerDetails}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Form Fields */}
              <ManagerFormFields
                formData={formData}
                errors={errors}
                passwordVisibility={passwordVisibility}
                onInputChange={handleInputChange}
                onTogglePasswordVisibility={togglePasswordVisibility}
                onGeneratePassword={generateRandomPassword}
              />

              {/* Action Buttons */}
              <FormActions
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
              />
            </form>
          </div>

          {/* Information Card */}
          <InformationCard />
        </div>
      </div>
    </div>
  );
};

// Protect this page for OWNER role only
export default withAuth(CreateManagerPage, {
  requiredRoles: ["OWNER"],
});
