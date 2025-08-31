import React from "react";
import { User } from "lucide-react";

function Header() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="p-3 rounded-xl text-white"
          style={{ backgroundColor: "#3674B5" }}
        >
          <User size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">
            Manage your personal information and leave requests
          </p>
        </div>
      </div>
    </div>
  );
}

export default Header;
