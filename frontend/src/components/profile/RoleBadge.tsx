import React from "react";
import { UserCheck } from "lucide-react";
import { Role } from "@/types/profile";

interface RoleBadgeProps {
  role: Role;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  return (
    <div className="mb-6">
      <span 
        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white capitalize"
        style={{ backgroundColor: "#3674B5" }}
      >
        <UserCheck size={16} className="mr-2" />
        {role}
      </span>
    </div>
  );
};

export default RoleBadge;