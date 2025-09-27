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

  const fetchRoles = async () => {
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";
      const response = await fetch(`${API_BASE_URL}/api/auth/roles`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
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
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl relative">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 justify-center">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Role-Based User Creation
          </h3>
          <div className="flex justify-center mx-auto w-1/3 gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
