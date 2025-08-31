import React from "react";
import { Users, X } from "lucide-react";
import { StaffMember } from "./types";
import { StaffTableRow } from "./StaffTableRow";

interface StaffTableProps {
  staff: StaffMember[];
  filteredStaff: StaffMember[];
  loading: boolean;
  error: string | null;
  editingId: number | null;
  editingItem: StaffMember | null;
  showEditTypeDropdown: boolean;
  onEdit: (member: StaffMember) => void;
  onSave: () => void;
  onCancel: () => void;
  onToggleActive: (id: number) => void;
  onRemove: (id: number) => void;
  onEditingChange: (field: keyof StaffMember, value: any) => void;
  onToggleEditTypeDropdown: () => void;
  onEditTypeChange: (typeId: string) => void;
  onRetry: () => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  filteredStaff,
  loading,
  error,
  editingId,
  editingItem,
  showEditTypeDropdown,
  onEdit,
  onSave,
  onCancel,
  onToggleActive,
  onRemove,
  onEditingChange,
  onToggleEditTypeDropdown,
  onEditTypeChange,
  onRetry,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Staff Member
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Phone
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Address
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Types
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Salary
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Leave Remaining
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member) => (
              <StaffTableRow
                key={member.id}
                member={member}
                isEditing={editingId === member.id}
                editingItem={editingItem}
                onEdit={onEdit}
                onSave={onSave}
                onCancel={onCancel}
                onToggleActive={onToggleActive}
                onRemove={onRemove}
                onEditingChange={onEditingChange}
                showEditTypeDropdown={showEditTypeDropdown}
                onToggleEditTypeDropdown={onToggleEditTypeDropdown}
                onEditTypeChange={onEditTypeChange}
              />
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3674B5] mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading staff members...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <X size={48} className="mx-auto text-red-300 mb-4" />
            <p className="text-red-500 text-lg">Error loading staff</p>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredStaff.length === 0 &&
          staff.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No staff members found</p>
              <p className="text-gray-400">
                Start by adding your first staff member
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          filteredStaff.length === 0 &&
          staff.length > 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                No staff members match your search
              </p>
              <p className="text-gray-400">
                Try adjusting your search criteria
              </p>
            </div>
          )}
      </div>
    </div>
  );
};
