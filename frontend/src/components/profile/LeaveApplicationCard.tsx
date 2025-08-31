import React, { useState } from "react";
import { Calendar, CalendarDays, Clock, Check } from "lucide-react";
import { Profile } from "@/types/profile";
import { getTodayDate } from "@/services/profileConstants";

interface LeaveApplicationCardProps {
  profile: Profile;
  onApplyLeave: (days: number) => void;
}

const LeaveApplicationCard: React.FC<LeaveApplicationCardProps> = ({
  profile,
  onApplyLeave,
}) => {
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');

  const handleApplyLeave = () => {
    if (leaveStartDate && leaveEndDate) {
      const start = new Date(leaveStartDate);
      const end = new Date(leaveEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays <= profile.remainingLeave) {
        onApplyLeave(diffDays);
        setLeaveStartDate('');
        setLeaveEndDate('');
        setShowLeaveForm(false);
        alert(`Leave application submitted successfully! ${diffDays} days will be deducted from your leave balance.`);
      } else {
        alert(`Insufficient leave balance! You only have ${profile.remainingLeave} days remaining.`);
      }
    }
  };

  const calculateLeaveDays = () => {
    if (leaveStartDate && leaveEndDate) {
      const start = new Date(leaveStartDate);
      const end = new Date(leaveEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: "#FADA7A" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays size={20} className="text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-800">Apply for Leave</h2>
          </div>
          {!showLeaveForm && (
            <button
              onClick={() => setShowLeaveForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: "#3674B5" }}
            >
              <Calendar size={16} />
              Apply Leave
            </button>
          )}
        </div>
      </div>

      {showLeaveForm && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={leaveStartDate}
                min={getTodayDate()}
                onChange={(e) => setLeaveStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={leaveEndDate}
                min={leaveStartDate || getTodayDate()}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
              />
            </div>
          </div>

          {leaveStartDate && leaveEndDate && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <Clock size={16} />
                <span className="font-medium">
                  Leave Duration: {calculateLeaveDays()} days
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Remaining balance after leave: {profile.remainingLeave - calculateLeaveDays()} days
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowLeaveForm(false);
                setLeaveStartDate('');
                setLeaveEndDate('');
              }}
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyLeave}
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
              style={{ backgroundColor: "#3674B5" }}
              disabled={!leaveStartDate || !leaveEndDate}
            >
              <Check size={16} />
              Submit Application
            </button>
          </div>
        </div>
      )}

      {!showLeaveForm && (
        <div className="p-6 text-center text-gray-500">
          <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg">No pending leave applications</p>
          <p className="text-sm">Click "Apply Leave" to request time off</p>
        </div>
      )}
    </div>
  );
};

export default LeaveApplicationCard;