"use client";
import React, { useState } from "react";
import { Users } from "lucide-react";
import { StaffMember } from "@/types/staff";
import StaffSummaryCards from "@/components/staff/SummaryCard";
import StaffFilters from "@/components/staff/Filters";
import AddMemberForm from "@/components/staff/AddMemberForm";
import StaffTable from "@/components/staff/StaffTable";
import Header from "@/components/staff/Header";

const StaffManagementPage = () => {
  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+94 77 123 4567",
      address: "123 Main St, Colombo 01",
      types: ["sales", "inventory"],
      salary: 75000,
      remainingLeave: 18,
      isActive: true,
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phone: "+94 71 987 6543",
      address: "456 Park Ave, Kandy",
      types: ["resources"],
      salary: 80000,
      remainingLeave: 21,
      isActive: true,
    },
    {
      id: "3",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@example.com",
      phone: "+94 76 555 0123",
      address: "789 Queen St, Galle",
      types: ["sales", "inventory", "resources"],
      salary: 90000,
      remainingLeave: 15,
      isActive: false,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  // Filter staff
  const filteredStaff = staff.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.some((type) => member.types.includes(type));
    return matchesSearch && matchesType;
  });

  const handleEdit = (updatedMember: StaffMember) => {
    setStaff((prev) =>
      prev.map((member) =>
        member.id === updatedMember.id ? updatedMember : member
      )
    );
  };

  const handleToggleActive = (id: string) => {
    setStaff((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, isActive: !member.isActive } : member
      )
    );
  };

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      setStaff((prev) => prev.filter((member) => member.id !== id));
    }
  };

  const handleAddMember = (memberData: Omit<StaffMember, 'id' | 'remainingLeave' | 'isActive'>) => {
    const newId = Math.max(...staff.map((s) => parseInt(s.id))) + 1;
    const member: StaffMember = {
      id: newId.toString(),
      ...memberData,
      remainingLeave: 21,
      isActive: true,
    };
    setStaff((prev) => [...prev, member]);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header/>


        {/* Summary Cards */}
        <StaffSummaryCards staff={staff} />

        {/* Filters and Add Button */}
        <StaffFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          showTypeFilter={showTypeFilter}
          setShowTypeFilter={setShowTypeFilter}
          onAddMember={() => setShowAddForm(!showAddForm)}
        />

        {/* Add Member Form */}
        {showAddForm && (
          <AddMemberForm
            onAddMember={handleAddMember}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Staff Table */}
        <StaffTable
          staff={filteredStaff}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
};

export default StaffManagementPage;