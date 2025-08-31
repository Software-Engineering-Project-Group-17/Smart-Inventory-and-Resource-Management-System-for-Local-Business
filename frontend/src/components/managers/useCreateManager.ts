"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { managerAPI, CreateManagerRequest } from "@/lib/api/managerAPI";
import { getUserProfile } from "@/lib/auth";
import { ManagerFormData, SubmitStatus } from "./types";
import { MANAGER_CONSTANTS } from "./managerConstants";

export const useCreateManager = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get branch info from URL parameters
  const branchId = searchParams.get("branchId");
  const branchName = searchParams.get("branchName");

  const [formData, setFormData] = useState<ManagerFormData>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
  });

  const [errors, setErrors] = useState<Partial<ManagerFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Validate we have required parameters
    if (!branchId || !branchName) {
      router.push("/branches");
      return;
    }

    // Get current user info
    const userProfile = getUserProfile();
    if (userProfile?.email) {
      setCurrentUserEmail(userProfile.email);
    }
  }, [branchId, branchName, router]);

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      password: password,
      confirmPassword: password,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ManagerFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = MANAGER_CONSTANTS.validation.emailRequired;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = MANAGER_CONSTANTS.validation.emailInvalid;
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = MANAGER_CONSTANTS.validation.firstNameRequired;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = MANAGER_CONSTANTS.validation.lastNameRequired;
    }

    if (!formData.password.trim()) {
      newErrors.password = MANAGER_CONSTANTS.validation.passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = MANAGER_CONSTANTS.validation.passwordMinLength;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = MANAGER_CONSTANTS.validation.passwordMismatch;
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
    if (errors[name as keyof ManagerFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !branchId) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Store current authentication state before manager creation
    const originalToken = localStorage.getItem("token");
    const originalUid = localStorage.getItem("uid");
    const originalProfile = localStorage.getItem("userProfile");

    try {
      // Get current user's Firebase UID
      const firebaseUid = localStorage.getItem("uid");
      if (!firebaseUid) {
        throw new Error("User authentication required");
      }

      const createManagerRequest: CreateManagerRequest = {
        creatorFirebaseUid: firebaseUid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        branchId: parseInt(branchId),
      };

      const result = await managerAPI.createManager(createManagerRequest);
      console.log("Manager creation result:", result);

      // Restore authentication state in case it was affected
      if (originalToken) localStorage.setItem("token", originalToken);
      if (originalUid) localStorage.setItem("uid", originalUid);
      if (originalProfile) localStorage.setItem("userProfile", originalProfile);

      setSubmitStatus("success");
      // Redirect back to branches page after 2 seconds
      setTimeout(() => {
        router.push("/branches");
      }, 2000);
    } catch (error) {
      console.error("Error creating manager:", error);

      // Restore authentication state even if manager creation failed
      if (originalToken) localStorage.setItem("token", originalToken);
      if (originalUid) localStorage.setItem("uid", originalUid);
      if (originalProfile) localStorage.setItem("userProfile", originalProfile);

      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/branches");
  };

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return {
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
  };
};
