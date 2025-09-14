"use client";
import React, { useState, useEffect } from "react";
import { toastUtils } from "@/lib/toast-utils";
import { showRoleAccessNotification } from "@/lib/auth";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  ChevronDown,
  Users,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  UserCheck,
  Filter,
} from "lucide-react";
import { withAuth } from "@/hooks/useAuth";

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  types: string[];
  salary: number;
  remainingLeave: number;
  isActive: boolean;
}

interface StaffType {
  id: string;
  name: string;
  color: string;
}

const StaffManagementPage = () => {
  const staffTypes: StaffType[] = [
    { id: "sales", name: "Sales", color: "#3674B5" },
    { id: "inventory", name: "Inventory", color: "#FADA7A" },
    { id: "resources", name: "Resources", color: "#10B981" },
  ];

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<StaffMember | null>(null);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showAddTypeDropdown, setShowAddTypeDropdown] = useState(false);
  const [showEditTypeDropdown, setShowEditTypeDropdown] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Fetch staff data for current manager
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user Firebase UID from localStorage
      const uid = localStorage.getItem("uid");
      console.log("Firebase UID from localStorage:", uid);

      if (!uid) {
        toastUtils.permissionError("view staff - please log in as a manager");
        setLoading(false);
        return;
      }

      const managerFirebaseUid = uid;
      console.log("Manager Firebase UID:", managerFirebaseUid);

      if (!managerFirebaseUid) {
        toastUtils.error(
          "Authentication Error",
          "Manager authentication not found"
        );
        setLoading(false);
        return;
      }

      // Use the dedicated staff endpoint for this manager
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";
      const apiUrl = `${API_BASE_URL}/api/roles/staff/manager/${managerFirebaseUid}`;
      console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.text();
        console.log("Raw API response:", result);

        const parsedResult = JSON.parse(result);
        console.log("Parsed API response:", parsedResult);

        // Map the staff data from the API response
        const staffMembers =
          parsedResult.staff?.map((staff: any) => ({
            id: staff.id,
            firstName: staff.firstName,
            lastName: staff.lastName,
            email: staff.email,
            phone: staff.phoneNumber || "",
            address: staff.address || "",
            types: staff.staffTypes || ["sales"], // Use the actual staff types from database
            salary: staff.salary || 0,
            remainingLeave: 21, // Default leave days
            isActive: staff.isActive !== false, // Default to true if not specified
          })) || [];

        console.log("Mapped staff members:", staffMembers);
        setStaff(staffMembers);
        toastUtils.dataLoaded("Staff members", staffMembers.length);
      } else {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        toastUtils.dataError("fetch staff data", errorText);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      toastUtils.networkError();
      setError("Failed to load staff data");
    } finally {
      setLoading(false);
    }
  };

  // Load staff data when component mounts
  useEffect(() => {
    showRoleAccessNotification("Staff Management");
    fetchStaff();
  }, []);

  // Add form state
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    types: [] as string[],
    salary: 0,
  });

  // Filter staff
  const filteredStaff = staff.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.some((type) => member.types.includes(type));
    return matchesSearch && matchesType;
  });

  const handleEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setEditingItem({ ...member });
  };

  const handleSave = () => {
    if (editingItem) {
      setStaff((prev) =>
        prev.map((member) =>
          member.id === editingItem.id ? editingItem : member
        )
      );
      setEditingId(null);
      setEditingItem(null);
      setShowEditTypeDropdown(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingItem(null);
    setShowEditTypeDropdown(false);
  };

  const handleToggleActive = (id: number) => {
    setStaff((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, isActive: !member.isActive } : member
      )
    );
  };

  const handleRemove = (id: number) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      setStaff((prev) => prev.filter((member) => member.id !== id));
    }
  };

  const handleAddMember = async () => {
    if (
      newMember.firstName &&
      newMember.lastName &&
      newMember.email &&
      newMember.password &&
      newMember.types.length > 0
    ) {
      try {
        // Get current user authentication info
        const uid = localStorage.getItem("uid");

        if (!uid) {
          toastUtils.permissionError(
            "create staff - please log in as a manager"
          );
          return;
        }

        const managerFirebaseUid = uid;

        if (!managerFirebaseUid) {
          toastUtils.error(
            "Authentication Error",
            "Manager Firebase UID not found. Please log in again."
          );
          return;
        }

        // Map frontend types to backend format (uppercase)
        const staffTypes = newMember.types.map((type) => type.toUpperCase());

        // Create staff request payload
        const createStaffRequest = {
          creatorFirebaseUid: managerFirebaseUid,
          firstName: newMember.firstName,
          lastName: newMember.lastName,
          email: newMember.email,
          password: newMember.password || "defaultPassword123", // Use form password or default
          phoneNumber: newMember.phone || "",
          address: newMember.address || "",
          staffTypes: staffTypes,
          salary: newMember.salary || 0,
        };

        // Call the staff creation API
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";
        const response = await fetch(`${API_BASE_URL}/api/roles/staff`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createStaffRequest),
        });

        const result = await response.text();
        let parsedResult;

        try {
          parsedResult = JSON.parse(result);
        } catch (e) {
          parsedResult = {
            message: result,
            status: response.ok ? "success" : "error",
          };
        }

        if (response.ok && parsedResult.status === "success") {
          // Reset form
          setNewMember({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            password: "",
            types: [],
            salary: 0,
          });
          setShowAddForm(false);
          setShowAddTypeDropdown(false);

          // Refresh staff list
          await fetchStaff();

          toastUtils.formSuccess(
            "Created Staff Member",
            `${newMember.firstName} ${newMember.lastName}`
          );
        } else {
          toastUtils.formError(
            "Create Staff Member",
            parsedResult.message || "Unknown error occurred"
          );
        }
      } catch (error) {
        console.error("Error creating staff:", error);
        toastUtils.networkError();
      }
    }
  };

  const handleTypeFilterChange = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleAddFormTypeChange = (typeId: string) => {
    setNewMember((prev) => ({
      ...prev,
      types: prev.types.includes(typeId)
        ? prev.types.filter((t) => t !== typeId)
        : [...prev.types, typeId],
    }));
  };

  const handleEditFormTypeChange = (typeId: string) => {
    if (editingItem) {
      setEditingItem((prev) =>
        prev
          ? {
              ...prev,
              types: prev.types.includes(typeId)
                ? prev.types.filter((t) => t !== typeId)
                : [...prev.types, typeId],
            }
          : null
      );
    }
  };

  const getTypeColor = (typeId: string) => {
    return staffTypes.find((t) => t.id === typeId)?.color || "#6B7280";
  };

  const getTypeName = (typeId: string) => {
    return staffTypes.find((t) => t.id === typeId)?.name || typeId;
  };

  const getTypeInitials = (typeId: string) => {
    const initials = {
      sales: "S",
      inventory: "I",
      resources: "R",
    };
    return (
      initials[typeId as keyof typeof initials] ||
      typeId.charAt(0).toUpperCase()
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
            notification.type === "success"
              ? "bg-green-50 border-green-400 text-green-800"
              : "bg-red-50 border-red-400 text-red-800"
          } max-w-md`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <X className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() =>
                  setNotification({ show: false, message: "", type: "success" })
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-3 rounded-xl text-white"
              style={{ backgroundColor: "#3674B5" }}
            >
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Staff Management
              </h1>
              <p className="text-gray-600">
                Manage your team members and their roles
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-lg text-white"
                style={{ backgroundColor: "#3674B5" }}
              >
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-lg text-white"
                style={{ backgroundColor: "#10B981" }}
              >
                <UserCheck size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter((member) => member.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-lg text-white"
                style={{ backgroundColor: "#FADA7A" }}
              >
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Leave Days</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    staff.reduce(
                      (sum, member) => sum + member.remainingLeave,
                      0
                    ) / staff.length
                  ) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-lg text-white"
                style={{ backgroundColor: "#3674B5" }}
              >
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Payroll</p>
                <p className="text-2xl font-bold text-gray-900">
                  LKR{" "}
                  {staff
                    .reduce((sum, member) => sum + member.salary, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Add Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent transition-all duration-200 focus:outline-none"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <button
                onClick={() => setShowTypeFilter(!showTypeFilter)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent flex items-center justify-between min-w-[150px]"
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <span
                    className={
                      selectedTypes.length > 0
                        ? "text-gray-900"
                        : "text-gray-500"
                    }
                  >
                    {selectedTypes.length > 0
                      ? `${selectedTypes.length} selected`
                      : "Filter by Role"}
                  </span>
                </div>
                <ChevronDown size={20} className="text-gray-400 ml-2" />
              </button>

              {showTypeFilter && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2">
                    {staffTypes.map((type) => (
                      <label
                        key={type.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type.id)}
                          onChange={() => handleTypeFilterChange(type.id)}
                          className="rounded border-gray-300 text-[#3674B5] focus:ring-[#3674B5]"
                        />
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        ></span>
                        <span className="text-sm text-gray-700">
                          {type.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 p-2">
                    <button
                      onClick={() => {
                        setSelectedTypes([]);
                        setShowTypeFilter(false);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add Member Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors duration-200 font-medium"
              style={{ backgroundColor: "#3674B5" }}
            >
              <Plus size={20} />
              Add Member
            </button>
          </div>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg text-white"
                style={{ backgroundColor: "#FADA7A" }}
              >
                <Plus size={20} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Add New Member
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={newMember.firstName}
                  onChange={(e) =>
                    setNewMember((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={newMember.lastName}
                  onChange={(e) =>
                    setNewMember((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newMember.password}
                  onChange={(e) =>
                    setNewMember((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) =>
                    setNewMember((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={newMember.address}
                  onChange={(e) =>
                    setNewMember((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  placeholder="Enter address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary (LKR)
                </label>
                <input
                  type="number"
                  value={newMember.salary}
                  onChange={(e) =>
                    setNewMember((prev) => ({
                      ...prev,
                      salary: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  placeholder="Enter salary"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roles
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowAddTypeDropdown(!showAddTypeDropdown)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {newMember.types.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {newMember.types.map((typeId) => (
                            <span
                              key={typeId}
                              className="px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: getTypeColor(typeId) }}
                            >
                              {getTypeName(typeId)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Select roles</span>
                      )}
                    </div>
                    <ChevronDown size={20} className="text-gray-400" />
                  </button>

                  {showAddTypeDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-2">
                        {staffTypes.map((type) => (
                          <label
                            key={type.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={newMember.types.includes(type.id)}
                              onChange={() => handleAddFormTypeChange(type.id)}
                              className="rounded border-gray-300 text-[#3674B5] focus:ring-[#3674B5]"
                            />
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: type.color }}
                            ></span>
                            <span className="text-sm text-gray-700">
                              {type.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                style={{ backgroundColor: "#3674B5" }}
                disabled={
                  !newMember.firstName ||
                  !newMember.lastName ||
                  !newMember.email ||
                  newMember.types.length === 0
                }
              >
                <Check size={16} />
                Add Member
              </button>
            </div>
          </div>
        )}

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: "#3674B5" }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Salary
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Remaining Leave
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      {editingId === member.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingItem?.firstName || ""}
                            onChange={(e) =>
                              setEditingItem((prev) =>
                                prev
                                  ? { ...prev, firstName: e.target.value }
                                  : null
                              )
                            }
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                            placeholder="First Name"
                          />
                          <input
                            type="text"
                            value={editingItem?.lastName || ""}
                            onChange={(e) =>
                              setEditingItem((prev) =>
                                prev
                                  ? { ...prev, lastName: e.target.value }
                                  : null
                              )
                            }
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                            placeholder="Last Name"
                          />
                        </div>
                      ) : (
                        <div className="font-medium text-gray-900">{`${member.firstName} ${member.lastName}`}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === member.id ? (
                        <input
                          type="email"
                          value={editingItem?.email || ""}
                          onChange={(e) =>
                            setEditingItem((prev) =>
                              prev ? { ...prev, email: e.target.value } : null
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                        />
                      ) : (
                        <span className="text-gray-600">{member.email}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === member.id ? (
                        <input
                          type="tel"
                          value={editingItem?.phone || ""}
                          onChange={(e) =>
                            setEditingItem((prev) =>
                              prev ? { ...prev, phone: e.target.value } : null
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                        />
                      ) : (
                        <span className="text-gray-600 whitespace-nowrap">
                          {member.phone}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === member.id ? (
                        <input
                          type="text"
                          value={editingItem?.address || ""}
                          onChange={(e) =>
                            setEditingItem((prev) =>
                              prev ? { ...prev, address: e.target.value } : null
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                        />
                      ) : (
                        <span className="text-gray-600">{member.address}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === member.id ? (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowEditTypeDropdown(!showEditTypeDropdown)
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent text-left flex items-center justify-between min-w-[120px]"
                          >
                            <div className="flex items-center gap-1">
                              {editingItem && editingItem.types.length > 0 ? (
                                <div className="flex gap-1">
                                  {editingItem.types.map((typeId) => (
                                    <span
                                      key={typeId}
                                      className="w-6 h-6 rounded-full text-xs font-medium text-white flex items-center justify-center"
                                      style={{
                                        backgroundColor: getTypeColor(typeId),
                                      }}
                                      title={getTypeName(typeId)}
                                    >
                                      {getTypeInitials(typeId)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  Select
                                </span>
                              )}
                            </div>
                            <ChevronDown size={16} className="text-gray-400" />
                          </button>

                          {showEditTypeDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                              <div className="p-2">
                                {staffTypes.map((type) => (
                                  <label
                                    key={type.id}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        editingItem?.types.includes(type.id) ||
                                        false
                                      }
                                      onChange={() =>
                                        handleEditFormTypeChange(type.id)
                                      }
                                      className="rounded border-gray-300 text-[#3674B5] focus:ring-[#3674B5]"
                                    />

                                    <span className="text-sm text-gray-700">
                                      {type.name}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-1 flex-wrap">
                          {member.types.map((typeId) => (
                            <span
                              key={typeId}
                              className="w-6 h-6 rounded-full text-xs font-medium text-white flex items-center justify-center"
                              style={{ backgroundColor: getTypeColor(typeId) }}
                              title={getTypeName(typeId)}
                            >
                              {getTypeInitials(typeId)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === member.id ? (
                        <input
                          type="number"
                          value={editingItem?.salary || ""}
                          onChange={(e) =>
                            setEditingItem((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    salary: parseInt(e.target.value) || 0,
                                  }
                                : null
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                        />
                      ) : (
                        <span className="text-gray-900 font-medium">
                          LKR {member.salary.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${
                          member.remainingLeave < 5
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {member.remainingLeave} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === member.id ? (
                          <>
                            <button
                              onClick={handleSave}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(member)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleActive(member.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                member.isActive
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-gray-400 hover:bg-gray-50"
                              }`}
                              title={
                                member.isActive ? "Deactivate" : "Activate"
                              }
                            >
                              <UserCheck size={16} />
                            </button>
                            <button
                              onClick={() => handleRemove(member.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3674B5] mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">
                  Loading staff members...
                </p>
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-12">
                <X size={48} className="mx-auto text-red-300 mb-4" />
                <p className="text-red-500 text-lg">Error loading staff</p>
                <p className="text-gray-400 mb-4">{error}</p>
                <button
                  onClick={fetchStaff}
                  className="px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:opacity-90"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading &&
              !error &&
              filteredStaff.length === 0 &&
              staff.length === 0 && (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">
                    No staff members found
                  </p>
                  <p className="text-gray-400">
                    Start by adding your first staff member
                  </p>
                </div>
              )}

            {!loading &&
              !error &&
              filteredStaff.length === 0 &&
              staff.length > 0 && (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">
                    No staff members match your search
                  </p>
                  <p className="text-gray-400">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(StaffManagementPage, {
  requiredRoles: ["BRANCH_MANAGER"],
});
