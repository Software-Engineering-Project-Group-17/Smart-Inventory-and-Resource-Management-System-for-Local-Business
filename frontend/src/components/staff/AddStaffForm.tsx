import React from "react";
import {
  X,
  Save,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  DollarSign,
} from "lucide-react";
import { NewStaffMember } from "./types";
import { STAFF_TYPES, getTypeColor, getTypeName } from "./constants";

interface AddStaffFormProps {
  isVisible: boolean;
  newMember: NewStaffMember;
  onMemberChange: (field: keyof NewStaffMember, value: any) => void;
  onSubmit: () => void;
  onClose: () => void;
  showTypeDropdown: boolean;
  onToggleTypeDropdown: () => void;
  onTypeChange: (typeId: string) => void;
}

export const AddStaffForm: React.FC<AddStaffFormProps> = ({
  isVisible,
  newMember,
  onMemberChange,
  onSubmit,
  onClose,
  showTypeDropdown,
  onToggleTypeDropdown,
  onTypeChange,
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Add New Staff Member
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={newMember.firstName}
            onChange={(e) => onMemberChange("firstName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={newMember.lastName}
            onChange={(e) => onMemberChange("lastName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail size={16} className="inline mr-2" />
            Email *
          </label>
          <input
            type="email"
            value={newMember.email}
            onChange={(e) => onMemberChange("email", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            type="password"
            value={newMember.password}
            onChange={(e) => onMemberChange("password", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone size={16} className="inline mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            value={newMember.phone}
            onChange={(e) => onMemberChange("phone", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign size={16} className="inline mr-2" />
            Salary (LKR)
          </label>
          <input
            type="number"
            value={newMember.salary}
            onChange={(e) =>
              onMemberChange("salary", parseInt(e.target.value) || 0)
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter salary amount"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin size={16} className="inline mr-2" />
            Address
          </label>
          <textarea
            value={newMember.address}
            onChange={(e) => onMemberChange("address", e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter full address"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Staff Types *
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={onToggleTypeDropdown}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3674B5] focus:border-transparent text-left flex items-center justify-between"
            >
              <span className="text-gray-700">
                {newMember.types.length > 0
                  ? `${newMember.types.length} type(s) selected`
                  : "Select staff types"}
              </span>
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform ${
                  showTypeDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showTypeDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                <div className="p-4 space-y-2">
                  {STAFF_TYPES.map((type) => (
                    <label
                      key={type.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newMember.types.includes(type.id)}
                        onChange={() => onTypeChange(type.id)}
                        className="w-4 h-4 rounded border-gray-300"
                        style={{ accentColor: type.color }}
                      />
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        ></div>
                        <span className="text-sm text-gray-700">
                          {type.name}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {newMember.types.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {newMember.types.map((typeId) => (
                <span
                  key={typeId}
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: getTypeColor(typeId) }}
                >
                  {getTypeName(typeId)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={
            !newMember.firstName ||
            !newMember.lastName ||
            !newMember.email ||
            !newMember.password ||
            newMember.types.length === 0
          }
          className="flex items-center gap-2 px-6 py-3 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#3674B5" }}
        >
          <Save size={20} />
          <span>Add Staff Member</span>
        </button>
      </div>
    </div>
  );
};
