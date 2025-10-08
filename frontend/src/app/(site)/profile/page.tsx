"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Edit3,
  Save,
  X,
  Hash,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toastUtils } from "@/lib/toast-utils";
import { showRoleAccessNotification } from "@/lib/auth";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { withAuth } from "@/hooks/useAuth";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  isActive: boolean;
  lastLoginAt?: string;
  role: string;
  branchName?: string;
  branchId?: number;
}

const ProfilePage = () => {
  const { isLoading: authLoading, isLoggedIn } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
  });

  // Fetch user profile from API
  const fetchProfile = async () => {
    try {
      // Get current user from localStorage
      const userProfileJson = localStorage.getItem("userProfile");
      if (!userProfileJson) {
        console.error("No user profile found in localStorage");
        toastUtils.error("Error", "Please log in to view your profile");
        return;
      }

      const currentUser = JSON.parse(userProfileJson);
      console.log("Current user from localStorage:", currentUser);

      const response = await authenticatedFetch("/api/profile", {
        headers: {
          "x-user-id": currentUser.id.toString(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        setFormData({
          name: data.user.name || "",
          phoneNumber: data.user.phoneNumber || "",
          address: data.user.address || "",
        });
      } else {
        console.error("Failed to fetch profile");
        toastUtils.error("Error", "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toastUtils.error("Error", "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Update form data when user data is loaded
  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      fetchProfile();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [isLoggedIn, authLoading]);

  // Update form data when profile is loaded
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        phoneNumber: userProfile.phoneNumber || "",
        address: userProfile.address || "",
      });
    }
  }, [userProfile]);

  // Debug logging
  useEffect(() => {
    // showRoleAccessNotification("Profile Management");
    console.log("ProfilePage Debug:", {
      authLoading,
      isLoading,
      isLoggedIn,
      userProfile: userProfile ? "Profile loaded" : "No profile",
    });
  }, [authLoading, isLoading, isLoggedIn, userProfile]);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!isLoggedIn || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get current user from localStorage
      const userProfileJson = localStorage.getItem("userProfile");
      if (!userProfileJson) {
        toastUtils.error("Error", "Please log in to update your profile");
        setIsSaving(false);
        return;
      }

      const currentUser = JSON.parse(userProfileJson);

      const response = await authenticatedFetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id.toString(),
        },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh profile data
        await fetchProfile();
        toastUtils.formSuccess("Profile updated successfully");
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        toastUtils.error(
          "Update Failed",
          errorData.error || "Failed to update profile"
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toastUtils.error("Update Failed", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: userProfile.name || "",
      phoneNumber: userProfile.phoneNumber || "",
      address: userProfile.address || "",
    });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-[#3674B5] rounded-full p-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {formData.name}
                </h1>
                <p className="text-gray-600">{userProfile.role}</p>
                <p className="text-sm text-gray-500">{userProfile.email}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3674B5] hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-800 border-b pb-2">
                Personal Information
              </h3>

              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {userProfile.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {formData.phoneNumber || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-800 border-b pb-2">
                Work Information
              </h3>

              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {userProfile.role}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Role cannot be changed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {userProfile.branchName || "Not assigned"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Branch cannot be changed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Hash className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch ID
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {userProfile.branchId || "Not assigned"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Branch ID cannot be changed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joined Date
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {userProfile.createdAt
                      ? new Date(userProfile.createdAt).toLocaleDateString()
                      : "Not available"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined date cannot be changed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {formData.address || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-md font-medium text-gray-800 mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {userProfile.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userProfile.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {userProfile.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {userProfile.lastLoginAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Login
                  </label>
                  <p className="text-sm text-gray-600">
                    {new Date(userProfile.lastLoginAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(ProfilePage, {
  requiredRoles: ["OWNER", "BRANCH_MANAGER", "STAFF"],
});
