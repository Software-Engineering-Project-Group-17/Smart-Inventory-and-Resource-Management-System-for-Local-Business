"use client";

import { useState, useEffect } from "react";
import { getUserProfile, clearAuthData } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export default function UserProfileHeader() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const profile = getUserProfile();
    setUserProfile(profile);
  }, []);

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  if (!userProfile) {
    return null;
  }

  return (
    <div className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {userProfile.firstName} {userProfile.lastName}
            </h2>
            <p className="text-sm text-gray-500">
              {userProfile.role} • {userProfile.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
