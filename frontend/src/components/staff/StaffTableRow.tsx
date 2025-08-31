import React from "react";
import { Edit, Save, X, UserCheck, Trash2, ChevronDown } from "lucide-react";
import { StaffMember } from "./types";
import {
  STAFF_TYPES,
  getTypeColor,
  getTypeName,
  getTypeInitials,
} from "./constants";

interface StaffTableRowProps {
  member: StaffMember;
  isEditing: boolean;
  editingItem: StaffMember | null;
  onEdit: (member: StaffMember) => void;
  onSave: () => void;
  onCancel: () => void;
  onToggleActive: (id: number) => void;
  onRemove: (id: number) => void;
  onEditingChange: (field: keyof StaffMember, value: any) => void;
  showEditTypeDropdown: boolean;
  onToggleEditTypeDropdown: () => void;
  onEditTypeChange: (typeId: string) => void;
}

export const StaffTableRow: React.FC<StaffTableRowProps> = ({
  member,
  isEditing,
  editingItem,
  onEdit,
  onSave,
  onCancel,
  onToggleActive,
  onRemove,
  onEditingChange,
  showEditTypeDropdown,
  onToggleEditTypeDropdown,
  onEditTypeChange,
}) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: "#3674B5" }}
          >
            {member.firstName.charAt(0)}
            {member.lastName.charAt(0)}
          </div>
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingItem?.firstName || ""}
                  onChange={(e) => onEditingChange("firstName", e.target.value)}
                  className="w-24 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                />
                <input
                  type="text"
                  value={editingItem?.lastName || ""}
                  onChange={(e) => onEditingChange("lastName", e.target.value)}
                  className="w-24 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                />
              </div>
            ) : (
              <>
                <p className="font-medium text-gray-900">
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <input
            type="email"
            value={editingItem?.email || ""}
            onChange={(e) => onEditingChange("email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
          />
        ) : (
          <span className="text-gray-900">{member.email}</span>
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <input
            type="tel"
            value={editingItem?.phone || ""}
            onChange={(e) => onEditingChange("phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
          />
        ) : (
          <span className="text-gray-900">{member.phone}</span>
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <textarea
            value={editingItem?.address || ""}
            onChange={(e) => onEditingChange("address", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
          />
        ) : (
          <span className="text-gray-900 text-sm">{member.address}</span>
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <div className="relative">
            <button
              onClick={onToggleEditTypeDropdown}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-sm">
                {editingItem?.types.length} selected
              </span>
              <ChevronDown size={16} />
            </button>
            {showEditTypeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2 space-y-1">
                  {STAFF_TYPES.map((type) => (
                    <label
                      key={type.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editingItem?.types.includes(type.id) || false}
                        onChange={() => onEditTypeChange(type.id)}
                        className="w-4 h-4"
                        style={{ accentColor: type.color }}
                      />
                      <span className="text-sm">{type.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {member.types.map((typeId) => (
              <span
                key={typeId}
                className="w-6 h-6 rounded-full text-xs font-medium text-white flex items-center justify-center"
                style={{ backgroundColor: getTypeColor(typeId) }}
                title={getTypeName(typeId)}
              >
                {getTypeInitials(typeId)}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <input
            type="number"
            value={editingItem?.salary || ""}
            onChange={(e) =>
              onEditingChange("salary", parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
          />
        ) : (
          <span className="text-gray-900 font-medium">
            LKR {member.salary.toLocaleString()}
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <span
          className={`font-medium ${
            member.remainingLeave < 5 ? "text-red-600" : "text-gray-900"
          }`}
        >
          {member.remainingLeave} days
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Save size={16} />
              </button>
              <button
                onClick={onCancel}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(member)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onToggleActive(member.id)}
                className={`p-2 rounded-lg transition-colors ${
                  member.isActive
                    ? "text-green-600 hover:bg-green-50"
                    : "text-gray-400 hover:bg-gray-50"
                }`}
                title={member.isActive ? "Deactivate" : "Activate"}
              >
                <UserCheck size={16} />
              </button>
              <button
                onClick={() => onRemove(member.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
