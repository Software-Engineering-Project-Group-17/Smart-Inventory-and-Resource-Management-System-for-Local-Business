"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Save,
  MapPin,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { withAuth } from "@/hooks/useAuth";
import { branchAPI, BranchCreateRequest } from "@/lib/api/branchAPI";
import { getUserProfile } from "@/lib/auth";

interface BranchFormData {
  name: string;
  location: string;
  contactNumber: string;
  description: string;
}

const CreateBranchPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<BranchFormData>({
    name: "",
    location: "",
    contactNumber: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<BranchFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const validateForm = (): boolean => {
    const newErrors: Partial<BranchFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Branch name is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Please enter a valid phone number";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
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
    if (errors[name as keyof BranchFormData]) {
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
      // Get current user's email
      const userProfile = getUserProfile();
      if (!userProfile?.email) {
        throw new Error("User profile not found. Please log in again.");
      }

      // Use the test endpoint since it's working and handles owner assignment
      const result = await branchAPI.testCreateBranch(
        formData,
        userProfile.email
      );
      console.log("Branch creation result:", result);

      setSubmitStatus("success");
      // Redirect back to branches page after 2 seconds
      setTimeout(() => {
        router.push("/branches");
      }, 2000);
    } catch (error) {
      console.error("Error creating branch:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/branches");
  };

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
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Create New Branch
                </h1>
                <p className="text-gray-600">
                  Add a new branch location to your organization
                </p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="text-green-800 font-medium">
                  Branch created successfully!
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
                  Failed to create branch
                </p>
                <p className="text-red-600 text-sm">
                  Please try again or contact support if the problem persists.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Branch Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Building2 size={16} className="inline mr-2" />
                  Branch Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter branch name (e.g., Downtown Branch)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
                    errors.name
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-blue-500"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <MapPin size={16} className="inline mr-2" />
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter full address (e.g., 123 Main Street, Downtown, City)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
                    errors.location
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-blue-500"
                  }`}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label
                  htmlFor="contactNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Phone size={16} className="inline mr-2" />
                  Contact Number *
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter contact number (e.g., +1-555-0123)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
                    errors.contactNumber
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-blue-500"
                  }`}
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.contactNumber}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <FileText size={16} className="inline mr-2" />
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter a brief description of the branch (e.g., Main customer service center for downtown area)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none resize-none ${
                    errors.description
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-blue-500"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.description}
                  </p>
                )}
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Create Branch
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              Tips for creating a branch:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Use descriptive names that clearly identify the location
              </li>
              <li>
                • Include complete address information for accurate location
                tracking
              </li>
              <li>• Provide a primary contact number for customer inquiries</li>
              <li>
                • Write a clear description of the branch's purpose and services
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protect this page for OWNER role only (since only owners can create branches)
export default withAuth(CreateBranchPage, {
  requiredRoles: ["OWNER"],
});
