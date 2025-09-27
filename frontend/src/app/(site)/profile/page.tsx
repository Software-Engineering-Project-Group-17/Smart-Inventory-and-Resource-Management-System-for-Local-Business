"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toastUtils } from "@/lib/toast-utils";
import { showRoleAccessNotification } from "@/lib/auth";

const ProfilePage = () => {
  const { user, isLoading, isLoggedIn, userRole, userEmail, userName } =
    useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "",
  });

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: userName || "",
        email: userEmail || "",
        phone: user.phoneNumber || "",
        address: user.address || "",
        department: user.department || "",
      });
    }
  }, [user, userName, userEmail]);

  // Debug logging
  useEffect(() => {
    showRoleAccessNotification("Profile Management");
    console.log("ProfilePage Debug:", {
      isLoading,
      isLoggedIn,
      user: user ? "User object exists" : "No user",
      userRole,
      userEmail,
      userName,
    });
  }, [isLoading, isLoggedIn, user, userRole, userEmail, userName]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!isLoggedIn || !user) {
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

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving profile data:", formData);
    toastUtils.formSuccess("Profile updated successfully");
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: userName || "",
      email: userEmail || "",
      phone: user.phoneNumber || "",
      address: user.address || "",
      department: user.department || "",
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
              <div className="bg-blue-600 rounded-full p-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {formData.name}
                </h1>
                <p className="text-gray-600">{userRole}</p>
                <p className="text-sm text-gray-500">{formData.email}</p>
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
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
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
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.email}</p>
                  )}
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
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {formData.phone || "Not provided"}
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
                <Briefcase className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <p className="text-gray-900">{userRole}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {formData.department || "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joined Date
                  </label>
                  <p className="text-gray-900">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Not available"}
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
                  {user.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {user.lastLoginAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Login
                  </label>
                  <p className="text-sm text-gray-600">
                    {new Date(user.lastLoginAt).toLocaleString()}
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

export default ProfilePage;
