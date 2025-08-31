import React from "react";
import { Users, UserCheck, Calendar, DollarSign } from "lucide-react";
import { StaffMember } from "@/types/staff";

interface StaffSummaryCardsProps {
  staff: StaffMember[];
}

const StaffSummaryCards: React.FC<StaffSummaryCardsProps> = ({ staff }) => {
  return (
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
  );
};

export default StaffSummaryCards;