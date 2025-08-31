"use client";
import React, { useState } from "react";
import { StaffMember, NewStaffMember } from "@/components/staff/types";
import { useStaffManagement } from "@/components/staff/useStaffManagement";
import { Notification } from "@/components/staff/Notification";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { StaffSummaryCards } from "@/components/staff/StaffSummaryCards";
import { StaffFilters } from "@/components/staff/StaffFilters";
import { AddStaffForm } from "@/components/staff/AddStaffForm";
import { StaffTable } from "@/components/staff/StaffTable";

const StaffManagementPage = () => {
  const {
    staff,
    loading,
    error,
    notification,
    createStaff,
    updateStaff,
    toggleStaffActive,
    removeStaff,
    fetchStaff,
    setNotification,
  } = useStaffManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showAddTypeDropdown, setShowAddTypeDropdown] = useState(false);
  const [showEditTypeDropdown, setShowEditTypeDropdown] = useState(false);

  // Form State
  const [newMember, setNewMember] = useState<NewStaffMember>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    types: [],
    salary: 0,
  });


  // Filter staff
  const filteredStaff = staff.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.some((type) => member.types.includes(type));
    return matchesSearch && matchesType;
  });

  // Event Handlers
  const handleEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setEditingItem({ ...member });
  };

  const handleSave = () => {
    if (editingItem) {
      updateStaff(editingItem);
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

  const handleAddMember = async () => {
    if (
      newMember.firstName &&
      newMember.lastName &&
      newMember.email &&
      newMember.password &&
      newMember.types.length > 0
    ) {
      const success = await createStaff(newMember);
      if (success) {
        setNewMember({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          password: "",
          types: [],
          salary: 0,
        });
        setShowAddForm(false);
        setShowAddTypeDropdown(false);
      }
    }
  };

  const handleTypeFilterChange = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleAddFormTypeChange = (typeId: string) => {
    setNewMember((prev) => ({
      ...prev,
      types: prev.types.includes(typeId)
        ? prev.types.filter((t) => t !== typeId)
        : [...prev.types, typeId],
    }));
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

  const handleNewMemberChange = (field: keyof NewStaffMember, value: any) => {
    setNewMember((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditingChange = (field: keyof StaffMember, value: any) => {
    if (editingItem) {
      setEditingItem((prev) => (prev ? { ...prev, [field]: value } : null));
    }

  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <Notification
        notification={notification}
        onClose={() =>
          setNotification({ show: false, message: "", type: "success" })
        }
      />

      <div className="max-w-7xl mx-auto">
        <StaffHeader />

        <StaffSummaryCards staff={staff} />

        <StaffFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedTypes={selectedTypes}
          onTypeFilterChange={handleTypeFilterChange}
          showTypeFilter={showTypeFilter}
          onToggleTypeFilter={() => setShowTypeFilter(!showTypeFilter)}
          onAddStaff={() => setShowAddForm(true)}
        />

        <AddStaffForm
          isVisible={showAddForm}
          newMember={newMember}
          onMemberChange={handleNewMemberChange}
          onSubmit={handleAddMember}
          onClose={() => {
            setShowAddForm(false);
            setShowAddTypeDropdown(false);
          }}
          showTypeDropdown={showAddTypeDropdown}
          onToggleTypeDropdown={() =>
            setShowAddTypeDropdown(!showAddTypeDropdown)
          }
          onTypeChange={handleAddFormTypeChange}
        />

        <StaffTable
          staff={staff}
          filteredStaff={filteredStaff}
          loading={loading}
          error={error}
          editingId={editingId}
          editingItem={editingItem}
          showEditTypeDropdown={showEditTypeDropdown}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onToggleActive={toggleStaffActive}
          onRemove={removeStaff}
          onEditingChange={handleEditingChange}
          onToggleEditTypeDropdown={() =>
            setShowEditTypeDropdown(!showEditTypeDropdown)
          }
          onEditTypeChange={handleEditFormTypeChange}
          onRetry={fetchStaff}
        />

      </div>
    </div>
  );
};

export default StaffManagementPage;