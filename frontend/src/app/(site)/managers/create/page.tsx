"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserCheck,
  ArrowLeft,
  Save,
  Mail,
  User,
  Lock,
  Building2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Phone,
  MapPin,
} from "lucide-react";
import { withAuth } from "@/hooks/useAuth";
import { managerAPI, CreateManagerRequest } from "@/lib/api/managerAPI";
import { getUserProfile } from "@/lib/auth";

interface ManagerFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
}

const CreateManagerPage = () => {
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
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
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
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  if (!branchId || !branchName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Parameters
          </h2>
          <p className="text-gray-600">
            Branch information is missing. Redirecting...
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
          <div className="mb-8">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
            >
              <ArrowLeft size={20} />
              <span>Back to Branches</span>
            </button>

            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl text-white"
                style={{ backgroundColor: "#3674B5" }}
              >
                <UserCheck size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Create Branch Manager
                </h1>
                <p className="text-gray-600">
                  Create a new manager for{" "}
                  <span className="font-medium">
                    {decodeURIComponent(branchName)}
                  </span>
                </p>
                {currentUserEmail && (
                  <p className="text-sm text-gray-500 mt-1">
                    Creating as: {currentUserEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="text-green-800 font-medium">
                  Manager created successfully!
                </p>
                <p className="text-green-600 text-sm">
                  Redirecting to branches page...
                </p>
              </div>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <div>
                <p className="text-red-800 font-medium">
                  Failed to create manager
                </p>
                <p className="text-red-600 text-sm">
                  Please try again or contact support if the problem persists.
                </p>
              </div>
            </div>
          )}

          {/* Branch Info Card */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 size={20} className="text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">
                  Assigning to Branch
                </h3>
                <p className="text-blue-700">
                  {decodeURIComponent(branchName)} (ID: {branchId})
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Mail size={16} className="inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter manager's email address"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
                    errors.email
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* First Name and Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <User size={16} className="inline mr-2" />
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
                      errors.firstName
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200 focus:ring-blue-500"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <User size={16} className="inline mr-2" />
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
                      errors.lastName
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200 focus:ring-blue-500"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    <Lock size={16} className="inline mr-2" />
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter a secure password (min 8 characters)"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
                      errors.password
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200 focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Lock size={16} className="inline mr-2" />
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm the password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
                      errors.confirmPassword
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200 focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Phone size={16} className="inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number (optional)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:outline-none"
                />
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <MapPin size={16} className="inline mr-2" />
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));
                  }}
                  placeholder="Enter address (optional)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#3674B5" }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Creating Manager...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Create Manager
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Information Card */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-medium text-amber-900 mb-2">
              Important Information:
            </h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>
                • The manager will be automatically assigned to this branch
              </li>
              <li>• They will receive BRANCH_MANAGER role permissions</li>
              <li>• Share the password securely with the new manager</li>
              <li>• The manager should change their password on first login</li>
              <li>• Only owners can create and manage branch managers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protect this page for OWNER role only
export default withAuth(CreateManagerPage, {
  requiredRoles: ["OWNER"],
});
