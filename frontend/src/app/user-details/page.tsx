"use client";

import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Navbar from "@/components/ui/navbar";
import { User, Mail, Phone, Calendar, UserCheck } from "lucide-react";

const UserDetailsExample = () => {
  const { user, isLoading, isLoggedIn, userRole, userEmail, userName } =
    useCurrentUser();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Show not logged in state
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Not Logged In
            </h2>
            <p className="text-gray-600">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Current User Details
          </h1>

          {/* User Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Basic Information
              </h2>

              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{userName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{userEmail}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">
                    {user.phoneNumber || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {userRole}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Account Details
              </h2>

              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-medium text-xs">{user.id}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
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
              </div>

              {user.lastLoginAt && (
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="font-medium">
                      {new Date(user.lastLoginAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Raw User Object (for debugging) */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-2">
              Raw User Data (for developers)
            </h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          {/* Usage Examples */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-md font-semibold text-blue-800 mb-2">
              How to Use This Data
            </h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>
                <strong>Get user role:</strong>{" "}
                <code>const userRole = getUserRole();</code>
              </p>
              <p>
                <strong>Get full profile:</strong>{" "}
                <code>const profile = getUserProfile();</code>
              </p>
              <p>
                <strong>Check if logged in:</strong>{" "}
                <code>const isAuth = isAuthenticated();</code>
              </p>
              <p>
                <strong>Using the hook:</strong>{" "}
                <code>
                  const &#123; user, userRole &#125; = useCurrentUser();
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsExample;
