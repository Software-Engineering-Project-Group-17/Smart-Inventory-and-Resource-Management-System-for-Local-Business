"use client"
import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Edit,
  Save,
  X,
  Check,
  CalendarDays,
  Clock,
  UserCheck
} from 'lucide-react';

interface StaffType {
  id: string;
  name: string;
  color: string;
}

const ProfilePage = () => {
  const [role, setRole] = useState<"owner" | "manager" | "staff">("manager");
  const [userType, setUserType] = useState<string[]>([
    "sales",
    "inventory",
    "resources",
  ]);

  const staffTypes: StaffType[] = [
    { id: 'sales', name: 'Sales', color: '#3674B5' },
    { id: 'inventory', name: 'Inventory', color: '#FADA7A' },
    { id: 'resources', name: 'Resources', color: '#10B981' }
  ];

  // Profile data state
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Anderson',
    email: 'john.anderson@company.com',
    phone: '+94 77 123 4567',
    address: '123 Business District, Colombo 03',
    salary: 120000,
    remainingLeave: 15
  });

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({...profile});
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setEditProfile({...profile});
  };

  const handleSave = () => {
    setProfile({...editProfile});
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile({...profile});
    setIsEditing(false);
  };

  const handleApplyLeave = () => {
    if (leaveStartDate && leaveEndDate) {
      const start = new Date(leaveStartDate);
      const end = new Date(leaveEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays <= profile.remainingLeave) {
        setProfile(prev => ({
          ...prev,
          remainingLeave: prev.remainingLeave - diffDays
        }));
        setLeaveStartDate('');
        setLeaveEndDate('');
        setShowLeaveForm(false);
        alert(`Leave application submitted successfully! ${diffDays} days will be deducted from your leave balance.`);
      } else {
        alert(`Insufficient leave balance! You only have ${profile.remainingLeave} days remaining.`);
      }
    }
  };

  const getTypeInitials = (typeId: string) => {
    const initials = {
      'sales': 'S',
      'inventory': 'I',
      'resources': 'R'
    };
    return initials[typeId as keyof typeof initials] || typeId.charAt(0).toUpperCase();
  };

  const getTypeColor = (typeId: string) => {
    return staffTypes.find(t => t.id === typeId)?.color || '#6B7280';
  };

  const getTypeName = (typeId: string) => {
    return staffTypes.find(t => t.id === typeId)?.name || typeId;
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-3 rounded-xl text-white"
              style={{ backgroundColor: "#3674B5" }}
            >
              <User size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your personal information and leave requests</p>
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-6">
          <span 
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white capitalize"
            style={{ backgroundColor: "#3674B5" }}
          >
            <UserCheck size={16} className="mr-2" />
            {role}
          </span>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: "#3674B5" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-[#3674B5] rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save size={16} />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editProfile.firstName}
                    onChange={(e) => setEditProfile(prev => ({...prev, firstName: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-lg">{profile.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editProfile.lastName}
                    onChange={(e) => setEditProfile(prev => ({...prev, lastName: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-lg">{profile.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editProfile.email}
                    onChange={(e) => setEditProfile(prev => ({...prev, email: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-lg">{profile.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editProfile.phone}
                    onChange={(e) => setEditProfile(prev => ({...prev, phone: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-lg whitespace-nowrap">{profile.phone}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editProfile.address}
                    onChange={(e) => setEditProfile(prev => ({...prev, address: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-lg">{profile.address}</p>
                )}
              </div>

              {/* Staff Types - Only for staff role */}
              {role === "staff" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserCheck size={16} className="inline mr-2" />
                    Assigned Roles
                  </label>
                  <div className="flex gap-2">
                    {userType.map(typeId => (
                      <div key={typeId} className="flex items-center gap-2">
                        <span 
                          className="w-8 h-8 rounded-full text-sm font-medium text-white flex items-center justify-center"
                          style={{ backgroundColor: getTypeColor(typeId) }}
                          title={getTypeName(typeId)}
                        >
                          {getTypeInitials(typeId)}
                        </span>
                        <span className="text-gray-700 font-medium">{getTypeName(typeId)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Salary and Leave Information */}
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

        {/* Leave Application Card */}
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
                      Leave Duration: {Math.ceil((new Date(leaveEndDate).getTime() - new Date(leaveStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Remaining balance after leave: {profile.remainingLeave - (Math.ceil((new Date(leaveEndDate).getTime() - new Date(leaveStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)} days
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

    
      
      </div>
    </div>
  );
};

export default ProfilePage;