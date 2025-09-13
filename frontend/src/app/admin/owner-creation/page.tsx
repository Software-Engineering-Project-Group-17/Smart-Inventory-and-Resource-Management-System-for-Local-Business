"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Input } from "@/components/ui/input";
import { toastUtils } from "@/lib/toast-utils";
import { showRoleAccessNotification } from "@/lib/auth";

export default function OwnerCreationPage() {
  const { user, isLoading } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [secretKey, setSecretKey] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const ADMIN_SECRET_KEY = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY;
  const canCreateOwner = secretKey === ADMIN_SECRET_KEY;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showMessage = (type: "success" | "error", text: string) => {
    if (type === "success") {
      toastUtils.success("Success", text);
    } else {
      toastUtils.error("Error", text);
    }
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate secret key
      if (!canCreateOwner) {
        showMessage("error", "Invalid secret key. Access denied.");
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.email || !formData.password) {
        showMessage("error", "Please fill in all required fields.");
        return;
      }

      // Validate password strength
      if (formData.password.length < 6) {
        showMessage("error", "Password must be at least 6 characters long.");
        return;
      }

      // Send to backend API
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";
      const response = await fetch(`${API_BASE_URL}/api/roles/owner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "OWNER", // Fixed role for owners
          secretKey: secretKey, // Include secret key for backend validation
        }),
      });

      if (response.ok) {
        showMessage("success", "Owner created successfully!");

        // Reset form but keep secret key
        setFormData({
          name: "",
          email: "",
          password: "",
        });
      } else {
        const errorData = await response.text();
        console.error("Failed to create owner:", errorData);
        showMessage("error", "Failed to create owner. Please try again.");
      }
    } catch (error) {
      console.error("Error creating owner:", error);
      showMessage("error", "An unexpected error occurred. Please try again.");
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
              Create New Owner (System Admin Only)
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This page is restricted to system administrators only. A valid
              secret key is required.
            </p>

            {message && (
              <div
                className={`mb-4 p-4 rounded-md ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Security Notice
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      This action requires system administrator privileges.
                      Please enter the admin secret key.
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="secretKey"
                  className="block text-sm font-medium text-gray-700"
                >
                  Admin Secret Key *
                </label>
                <Input
                  id="secretKey"
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter admin secret key"
                  required
                  className="mt-1"
                />
              </div>

              {canCreateOwner && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Access Granted
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        Valid secret key entered. You can now create an owner
                        account.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                  required
                  className="mt-1"
                  disabled={!canCreateOwner}
                />
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
                  disabled={!canCreateOwner}
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
                  disabled={!canCreateOwner}
                  minLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Role Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      This user will be created with <strong>OWNER</strong> role
                      and will have full system access including the ability to
                      create managers.
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !canCreateOwner}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Owner"}
              </button>

              {!canCreateOwner && (
                <p className="text-sm text-gray-500 text-center">
                  Please enter a valid admin secret key to enable the form.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
