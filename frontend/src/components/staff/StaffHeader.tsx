import React from "react";
import { Users } from "lucide-react";

export const StaffHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="p-3 rounded-xl text-white"
          style={{ backgroundColor: "#3674B5" }}
        >
          <Users size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">
            Manage your team members and their roles
          </p>
        </div>
      </div>
    </div>
  );
};
