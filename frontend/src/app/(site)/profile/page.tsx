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

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-medium text-gray-600 tracking-wide mb-1">
    {children}
  </label>
);

const FieldShell = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-3 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
    {children}
  </div>
);

const Text = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-900 text-sm">{children}</p>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full bg-transparent outline-none text-sm placeholder:text-gray-400 ${
      props.className || ""
    }`}
  />
);

const Chip = ({ active }: { active: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${
      active
        ? "bg-green-50 text-green-700 ring-green-200"
        : "bg-red-50 text-red-700 ring-red-200"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        active ? "bg-green-500" : "bg-red-500"
      }`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

const ActionButton = ({
  onClick,
  variant = "secondary",
  children,
}: {
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}) => {
  const base =
    "inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles = {
    primary:
      "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-300",
    secondary:
      "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 focus:ring-gray-300",
    danger:
      "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 focus:ring-gray-300",
  } as const;
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
};

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
        phone: (user as any).phoneNumber || "",
        address: (user as any).address || "",
        department: (user as any).department || "",
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

  // Loading state (polished)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto px-4 pt-24">
          <div className="animate-pulse space-y-6">
            <div className="h-32 rounded-2xl bg-slate-100" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 rounded-2xl bg-slate-100" />
              <div className="h-48 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in state (polished)
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-2xl mx-auto px-4 pt-24 text-center">
          <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-gray-100 p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access denied
            </h2>
            <p className="text-gray-600">
              Please log in to view your profile.
            </p>
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
      phone: (user as any).phoneNumber || "",
      address: (user as any).address || "",
      department: (user as any).department || "",
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
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Top banner */}
      <div className="bg-gradient-to-r blue-600 ">
        <div className="max-w-5xl mx-auto px-4">
          <div className="h-28 md:h-36" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 md:-mt-20 pb-16">
        {/* Profile Header Card */}
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="shrink-0 grid place-items-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-inner">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                  {formData.name || "Unnamed User"}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-gray-400" /> {userRole}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-4 w-4 text-gray-400" /> {formData.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!isEditing ? (
                <ActionButton onClick={handleEdit}>
                  <Edit3 className="h-4 w-4" /> Edit profile
                </ActionButton>
              ) : (
                <>
                  <ActionButton onClick={handleSave} variant="primary">
                    <Save className="h-4 w-4" /> Save changes
                  </ActionButton>
                  <ActionButton onClick={handleCancel}>
                    <X className="h-4 w-4" /> Cancel
                  </ActionButton>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-7">
            <h2 className="text-base font-semibold text-gray-900 tracking-tight mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" /> Personal information
            </h2>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <Label>Full name</Label>
                <FieldShell>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <Text>{formData.name}</Text>
                  )}
                </FieldShell>
              </div>

              {/* Email */}
              <div>
                <Label>Email address</Label>
                <FieldShell>
                  {isEditing ? (
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@company.com"
                    />
                  ) : (
                    <Text>{formData.email}</Text>
                  )}
                </FieldShell>
              </div>

              {/* Phone */}
              <div>
                <Label>Phone number</Label>
                <FieldShell>
                  {isEditing ? (
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +94 77 123 4567"
                    />
                  ) : (
                    <Text>{formData.phone || "Not provided"}</Text>
                  )}
                </FieldShell>
              </div>
            </div>
          </section>

          {/* Work Information */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-7">
            <h2 className="text-base font-semibold text-gray-900 tracking-tight mb-5 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gray-400" /> Work information
            </h2>

            <div className="space-y-5">
              {/* Role (read-only) */}
              <div>
                <Label>Role</Label>
                <FieldShell>
                  <Text>{userRole}</Text>
                </FieldShell>
              </div>

              {/* Department */}
              <div>
                <Label>Department</Label>
                <FieldShell>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g. Engineering"
                    />
                  ) : (
                    <Text>{formData.department || "Not specified"}</Text>
                  )}
                </FieldShell>
              </div>

              {/* Joined Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label>Joined date</Label>
                  <FieldShell>
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Not available"}
                    </div>
                  </FieldShell>
                </div>

                <div>
                  <Label>Status</Label>
                  <div className="flex items-center h-[46px]">
                    <Chip active={(user as any).isActive} />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <Label>Address</Label>
                <FieldShell>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street, City, Country"
                    />
                  ) : (
                    <div className="flex items-start gap-2 text-sm text-gray-900">
                      <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                      <span>{formData.address || "Not provided"}</span>
                    </div>
                  )}
                </FieldShell>
              </div>
            </div>
          </section>
        </div>

        {/* Account Information */}
        <section className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-7">
          <h3 className="text-base font-semibold text-gray-900 tracking-tight mb-5">
            Account information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>User ID</Label>
              <FieldShell>
                <p className="text-[13px] text-gray-700 break-all select-all">
                  {(user as any).id}
                </p>
              </FieldShell>
            </div>

            <div>
              <Label>Status</Label>
              <div className="flex items-center h-[46px]">
                <Chip active={(user as any).isActive} />
              </div>
            </div>

            {(user as any).lastLoginAt && (
              <div>
                <Label>Last login</Label>
                <FieldShell>
                  <p className="text-sm text-gray-700">
                    {new Date((user as any).lastLoginAt).toLocaleString()}
                  </p>
                </FieldShell>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
