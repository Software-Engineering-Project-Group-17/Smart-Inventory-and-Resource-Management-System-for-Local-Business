import React, { useState } from "react";
import { Plus, Check, ChevronDown } from "lucide-react";
import { StaffMember } from "@/types/staff";
import { staffTypes, getTypeColor, getTypeName } from "@/services/staffConstants";

interface AddMemberFormProps {
  onAddMember: (member: Omit<StaffMember, 'id' | 'remainingLeave' | 'isActive'>) => void;
  onCancel: () => void;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ onAddMember, onCancel }) => {
  const [showAddTypeDropdown, setShowAddTypeDropdown] = useState(false);
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    types: [] as string[],
    salary: 0,
  });

  const handleAddFormTypeChange = (typeId: string) => {
    setNewMember((prev) => ({
      ...prev,
      types: prev.types.includes(typeId)
        ? prev.types.filter((t) => t !== typeId)
        : [...prev.types, typeId],
    }));
  };

  const handleSubmit = () => {
    if (
      newMember.firstName &&
      newMember.lastName &&
      newMember.email &&
      newMember.types.length > 0
    ) {
      onAddMember(newMember);
      setNewMember({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        types: [],
        salary: 0,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-2 rounded-lg text-white"
          style={{ backgroundColor: "#FADA7A" }}
        >
          <Plus size={20} />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">
          Add New Member
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={newMember.firstName}
            onChange={(e) =>
              setNewMember((prev) => ({
                ...prev,
                firstName: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={newMember.lastName}
            onChange={(e) =>
              setNewMember((prev) => ({
                ...prev,
                lastName: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={newMember.email}
            onChange={(e) =>
              setNewMember((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={newMember.phone}
            onChange={(e) =>
              setNewMember((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            value={newMember.address}
            onChange={(e) =>
              setNewMember((prev) => ({
                ...prev,
                address: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salary (LKR)
          </label>
          <input
            type="number"
            value={newMember.salary}
            onChange={(e) =>
              setNewMember((prev) => ({
                ...prev,
                salary: parseInt(e.target.value) || 0,
              }))
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter salary"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roles
          </label>
          <div className="relative">
            <button
              onClick={() => setShowAddTypeDropdown(!showAddTypeDropdown)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {newMember.types.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {newMember.types.map((typeId) => (
                      <span
                        key={typeId}
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getTypeColor(typeId) }}
                      >
                        {getTypeName(typeId)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">Select roles</span>
                )}
              </div>
              <ChevronDown size={20} className="text-gray-400" />
            </button>

            {showAddTypeDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-2">
                  {staffTypes.map((type) => (
                    <label
                      key={type.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newMember.types.includes(type.id)}
                        onChange={() => handleAddFormTypeChange(type.id)}
                        className="rounded border-gray-300 text-[#3674B5] focus:ring-[#3674B5]"
                      />
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      ></span>
                      <span className="text-sm text-gray-700">
                        {type.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
          style={{ backgroundColor: "#3674B5" }}
          disabled={
            !newMember.firstName ||
            !newMember.lastName ||
            !newMember.email ||
            newMember.types.length === 0
          }
        >
          <Check size={16} />
          Add Member
        </button>
      </div>
    </div>
  );
};

export default AddMemberForm;