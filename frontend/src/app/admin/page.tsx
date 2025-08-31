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
    </div>
  );
}

// // Protect this page for ADMIN and OWNER roles only
// export default withAuth(AdminDashboard, {
//   requiredRoles: ["ADMIN", "OWNER"],
// });
export default AdminDashboard;
