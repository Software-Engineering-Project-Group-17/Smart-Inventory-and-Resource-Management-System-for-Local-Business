import { useState } from "react";
import { useRouter } from "next/navigation";
import { BranchFormData, BranchFormErrors, SubmitStatus } from "./createTypes";
import { CREATE_BRANCH_CONSTANTS } from "./createConstants";
import { branchAPI, BranchCreateRequest } from "@/lib/api/branchAPI";
import { getUserProfile } from "@/lib/auth";

export const useCreateBranch = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<BranchFormData>({
    name: "",
    location: "",
    contactNumber: "",
    description: "",
  });

  const [errors, setErrors] = useState<BranchFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  const validateForm = (): boolean => {
    const newErrors: BranchFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = CREATE_BRANCH_CONSTANTS.validation.nameRequired;
    }

    if (!formData.location.trim()) {
      newErrors.location = CREATE_BRANCH_CONSTANTS.validation.locationRequired;
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber =
        CREATE_BRANCH_CONSTANTS.validation.contactRequired;
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.contactNumber)) {
      newErrors.contactNumber =
        CREATE_BRANCH_CONSTANTS.validation.contactInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof BranchFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Get current user's Firebase UID
      const userProfile = getUserProfile();
      if (!userProfile?.email) {
        throw new Error("User profile not found. Please log in again.");
      }

      const firebaseUid = localStorage.getItem("uid");
      if (!firebaseUid) {
        throw new Error("User authentication required");
      }

      const createRequest: BranchCreateRequest = {
        name: formData.name,
        location: formData.location,
        contactNumber: formData.contactNumber,
        description: formData.description,
      };

      const result = await branchAPI.createBranch(createRequest);
      console.log("Branch creation result:", result);

      setSubmitStatus("success");
      // Redirect back to branches page after 2 seconds
      setTimeout(() => {
        router.push("/branches");
      }, 2000);
    } catch (error) {
      console.error("Error creating branch:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/branches");
  };

  return {
    // Form data
    formData,
    errors,
    isSubmitting,
    submitStatus,

    // Actions
    handleInputChange,
    handleSubmit,
    handleCancel,
    validateForm,
  };
};
