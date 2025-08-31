"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { withAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Input from "@/components/admin/Input";

interface Role {
  id: number;
  role: string;
  description: string;
}

interface Branch {
  id: number;
  name: string;
  location: string;
  description: string;
  contactNumber: string;
}

function AdminDashboard() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Fetch roles and branches on component mount
  useEffect(() => {
    fetchRoles();
    fetchBranches();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch("http://localhost:8084/api/auth/roles");
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch("http://localhost:8084/api/auth/branches");
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !selectedRole ||
      !selectedBranch
    ) {
      toast("All fields are required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8084/api/auth/admin/create-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            role: selectedRole,
            branchId: parseInt(selectedBranch),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      const data = await response.json();

      toast(`User ${firstName} ${lastName} created successfully!`);

      // Reset form
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setSelectedRole("");
      setSelectedBranch("");
    } catch (error) {
      console.error("User creation error:", error);
      toast(
        error instanceof Error
          ? error.message
          : "Failed to create user. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Manage users and create new accounts
        </p>
      </div>

      {/* Role Creation Navigation */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Role-Based User Creation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Owner Creation - Restricted */}
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">Owner Creation</h4>
              <p className="text-sm text-red-600 mb-4">System Admin Only</p>
              <button
                onClick={() => router.push("/admin/owner-creation")}
                className="w-full py-2 px-4 border border-red-300 rounded-md shadow-sm bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200"
              >
                Create Owner
              </button>
            </div>

            {/* Manager Creation - Owner Only */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">
                Manager Creation
              </h4>
              <p className="text-sm text-blue-600 mb-4">
                {user?.role === "OWNER" ? "Available" : "Owner Only"}
              </p>
              <button
                onClick={() => router.push("/admin/manager-creation")}
                disabled={user?.role !== "OWNER"}
                className="w-full py-2 px-4 border border-blue-300 rounded-md shadow-sm bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Manager
              </button>
            </div>

            {/* Staff Creation - Manager+ */}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">
                Staff Creation
              </h4>
              <p className="text-sm text-green-600 mb-4">
                {user?.role === "OWNER" || user?.role === "MANAGER"
                  ? "Available"
                  : "Manager+ Only"}
              </p>
              <button
                onClick={() => router.push("/admin/staff-creation")}
                disabled={user?.role !== "OWNER" && user?.role !== "MANAGER"}
                className="w-full py-2 px-4 border border-green-300 rounded-md shadow-sm bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Staff
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legacy User Creation Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Legacy User Creation
          </h3>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              name="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <Input
              name="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <Input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select Role</option>
                {roles.map((role, i) => (
                  <option key={i} value={role.role}>
                    {role.role} - {role.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="branch"
                className="block text-sm font-medium text-gray-700"
              >
                Branch
              </label>
              <select
                id="branch"
                name="branch"
                required
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id.toString()}>
                    {branch.name} - {branch.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Quick Actions
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedRole("MANAGER");
                  setFirstName("Branch");
                  setLastName("Manager");
                }}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Quick Manager
              </button>

              <button
                onClick={() => {
                  setSelectedRole("STAFF");
                  setFirstName("Staff");
                  setLastName("Member");
                }}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Quick Staff
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// // Protect this page for ADMIN and OWNER roles only
// export default withAuth(AdminDashboard, {
//   requiredRoles: ["ADMIN", "OWNER"],
// });
export default AdminDashboard;
