import React from "react";
import { DollarSign, Calendar } from "lucide-react";
import { Profile } from "@/types/profile";

interface SalaryLeaveCardsProps {
  profile: Profile;
}

const SalaryLeaveCards: React.FC<SalaryLeaveCardsProps> = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Salary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#3674B5" }}>
            <DollarSign size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Monthly Salary</h3>
            <p className="text-sm text-gray-600">Current compensation</p>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          LKR {profile.salary.toLocaleString()}
        </p>
      </div>

      {/* Leave Balance Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#10B981" }}>
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Leave Balance</h3>
            <p className="text-sm text-gray-600">Remaining days</p>
          </div>
        </div>
        <p className={`text-3xl font-bold ${profile.remainingLeave < 5 ? 'text-red-600' : 'text-gray-900'}`}>
          {profile.remainingLeave} days
        </p>
      </div>
    </div>
  );
};

export default SalaryLeaveCards;