import React from "react";
import { Building2, User, Users } from "lucide-react";

type Branch = {
  id: string;
  name: string;
  managerCount: number;
  staffCount: number;
};

type SummaryCardsProps = {
  branches: Branch[];
};

const SummaryCards: React.FC<SummaryCardsProps> = ({ branches }) => {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Total Branches */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-lg text-white"
            style={{ backgroundColor: "#3674B5" }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Branches</p>
            <p className="text-2xl font-bold text-gray-900">
              {branches.length}
            </p>
          </div>
        </div>
      </div>

      {/* Total Managers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-lg text-white"
            style={{ backgroundColor: "#FADA7A" }}
          >
            <User size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Managers</p>
            <p className="text-2xl font-bold text-gray-900">
              {branches.reduce((sum, branch) => sum + branch.managerCount, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Total Staff */}
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
              {branches.reduce((sum, branch) => sum + branch.staffCount, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
