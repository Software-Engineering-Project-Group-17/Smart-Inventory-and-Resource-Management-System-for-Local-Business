import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  Users,
  UserCheck,
} from "lucide-react";
import { StaffMember } from "@/types/staff";
import { staffTypes, getTypeColor, getTypeName, getTypeInitials } from "@/services/staffConstants";

interface StaffTableProps {
  staff: StaffMember[];
  onEdit: (member: StaffMember) => void;
  onToggleActive: (id: string) => void;
  onRemove: (id: string) => void;
}

const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  onEdit,
  onToggleActive,
  onRemove,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<StaffMember | null>(null);
  const [showEditTypeDropdown, setShowEditTypeDropdown] = useState(false);

  const handleEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setEditingItem({ ...member });
    onEdit(member);
  };

  const handleSave = () => {
    if (editingItem) {
      onEdit(editingItem);
      setEditingId(null);
      setEditingItem(null);
      setShowEditTypeDropdown(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingItem(null);
    setShowEditTypeDropdown(false);
  };

  const handleEditFormTypeChange = (typeId: string) => {
    if (editingItem) {
      setEditingItem((prev) =>
        prev
          ? {
              ...prev,
              types: prev.types.includes(typeId)
                ? prev.types.filter((t) => t !== typeId)
                : [...prev.types, typeId],
            }
          : null
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: "#3674B5" }}>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Phone
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Address
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Type
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Salary
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Remaining Leave
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  {editingId === member.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingItem?.firstName || ""}
                        onChange={(e) =>
                          setEditingItem((prev) =>
                            prev
                              ? { ...prev, firstName: e.target.value }
                              : null
                          )
                        }
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        value={editingItem?.lastName || ""}
                        onChange={(e) =>
                          setEditingItem((prev) =>
                            prev
                              ? { ...prev, lastName: e.target.value }
                              : null
                          )
                        }
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                        placeholder="Last Name"
                      />
                    </div>
                  ) : (
                    <div className="font-medium text-gray-900">{`${member.firstName} ${member.lastName}`}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === member.id ? (
                    <input
                      type="email"
                      value={editingItem?.email || ""}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev ? { ...prev, email: e.target.value } : null
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-600">{member.email}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === member.id ? (
                    <input
                      type="tel"
                      value={editingItem?.phone || ""}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev ? { ...prev, phone: e.target.value } : null
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-600 whitespace-nowrap">
                      {member.phone}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === member.id ? (
                    <input
                      type="text"
                      value={editingItem?.address || ""}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev ? { ...prev, address: e.target.value } : null
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-600">{member.address}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === member.id ? (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowEditTypeDropdown(!showEditTypeDropdown)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent text-left flex items-center justify-between min-w-[120px]"
                      >
                        <div className="flex items-center gap-1">
                          {editingItem && editingItem.types.length > 0 ? (
                            <div className="flex gap-1">
                              {editingItem.types.map((typeId) => (
                                <span
                                  key={typeId}
                                  className="w-6 h-6 rounded-full text-xs font-medium text-white flex items-center justify-center"
                                  style={{
                                    backgroundColor: getTypeColor(typeId),
                                  }}
                                  title={getTypeName(typeId)}
                                >
                                  {getTypeInitials(typeId)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Select
                            </span>
                          )}
                        </div>
                        <ChevronDown size={16} className="text-gray-400" />
                      </button>

                      {showEditTypeDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                          <div className="p-2">
                            {staffTypes.map((type) => (
                              <label
                                key={type.id}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    editingItem?.types.includes(type.id) ||
                                    false
                                  }
                                  onChange={() =>
                                    handleEditFormTypeChange(type.id)
                                  }
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
                  ) : (
                    <div className="flex gap-1 flex-wrap">
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
                  {editingId === member.id ? (
                    <input
                      type="number"
                      value={editingItem?.salary || ""}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev
                            ? {
                                ...prev,
                                salary: parseInt(e.target.value) || 0,
                              }
                            : null
                        )
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
                      member.remainingLeave < 5
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {member.remainingLeave} days
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {editingId === member.id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(member)}
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
                          title={
                            member.isActive ? "Deactivate" : "Activate"
                          }
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
            ))}
          </tbody>
        </table>

        {staff.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No staff members found</p>
            <p className="text-gray-400">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffTable;