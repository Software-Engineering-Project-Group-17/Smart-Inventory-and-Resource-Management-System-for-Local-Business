"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Input } from "@/components/ui/input";
import { toastUtils } from "@/lib/toast-utils";
import { showRoleAccessNotification } from "@/lib/auth";

export default function ManagerCreationPage() {
  const { user, isLoading } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show role access notification on page load
  useEffect(() => {
    showRoleAccessNotification("Manager Creation");
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    address: "",
    tel: "",
    branchId: "",
  });

  // Check if user has owner permissions (only owners can create managers)
  const canCreateManager = user?.role === "OWNER";

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.password
      ) {
        toastUtils.validationError(
          "Missing Information",
          "Please fill in all required fields."
        );
        return;
      }

      // Validate password strength
      if (formData.password.length < 6) {
        toastUtils.validationError(
          "Invalid Password",
          "Password must be at least 6 characters long."
        );
        return;
      }

      // Send to backend API
      const response = await fetch("http://localhost:8084/api/roles/manager", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          tel: formData.tel,
          role: "MANAGER", // Fixed role for managers
          branchId: formData.branchId ? parseInt(formData.branchId) : null,
        }),
      });

      if (response.ok) {
        toastUtils.formSuccess("Manager created successfully!");

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          address: "",
          tel: "",
          branchId: "",
        });
      } else {
        const errorData = await response.text();
        console.error("Failed to create manager:", errorData);
        toastUtils.error(
          "Creation Failed",
          "Failed to create manager. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating manager:", error);
      toastUtils.error(
        "Unexpected Error",
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!canCreateManager) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Access Denied
              </h3>
              <div className="mt-2 text-sm text-red-700">
                Only owners can create managers.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
              Create New Manager
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Create a new manager account. Only owners can access this page.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name *
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="Enter first name"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name *
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Enter last name"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password *
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter password (min. 6 characters)"
                  required
                  className="mt-1"
                  minLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor="tel"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <Input
                  id="tel"
                  type="tel"
                  value={formData.tel}
                  onChange={(e) => handleInputChange("tel", e.target.value)}
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter address"
                  className="mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="branchId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Branch ID (Optional)
                </label>
                <Input
                  id="branchId"
                  type="number"
                  value={formData.branchId}
                  onChange={(e) =>
                    handleInputChange("branchId", e.target.value)
                  }
                  placeholder="Enter branch ID"
                  className="mt-1"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Role Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      This user will be created with <strong>MANAGER</strong>{" "}
                      role and will be able to create staff members.
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Manager"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
