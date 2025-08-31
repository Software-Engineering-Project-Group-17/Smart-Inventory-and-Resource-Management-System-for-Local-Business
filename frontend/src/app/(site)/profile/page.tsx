"use client"
import React, { useState } from 'react';
import { Profile, Role } from '@/types/profile';
import Header from '@/components/profile/Header';
import RoleBadge from '@/components/profile/RoleBadge';
import ProfileInfoCard from '@/components/profile/ProfileInfoCard';
import SalaryLeaveCards from '@/components/profile/SalaryLeaveCard';
import LeaveApplicationCard from '@/components/profile/LeaveApplicationCard';

const ProfilePage = () => {
  const [role, setRole] = useState<Role>("manager");
  const [userType, setUserType] = useState<string[]>([
    "sales",
    "inventory",
    "resources",
  ]);

  // Profile data state
  const [profile, setProfile] = useState<Profile>({
    firstName: 'John',
    lastName: 'Anderson',
    email: 'john.anderson@company.com',
    phone: '+94 77 123 4567',
    address: '123 Business District, Colombo 03',
    salary: 120000,
    remainingLeave: 15
  });

  const handleProfileSave = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  const handleApplyLeave = (days: number) => {
    setProfile(prev => ({
      ...prev,
      remainingLeave: prev.remainingLeave - days

    }));
  };

  return (

    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Header />


        {/* Role Badge */}
        <RoleBadge role={role} />

        {/* Profile Information Card */}
        <ProfileInfoCard
          profile={profile}
          role={role}
          userType={userType}
          onSave={handleProfileSave}
        />

        {/* Salary and Leave Information */}
        <SalaryLeaveCards profile={profile} />

        {/* Leave Application Card */}
        <LeaveApplicationCard
          profile={profile}
          onApplyLeave={handleApplyLeave}
        />

      </div>
    </div>
  );
};

export default ProfilePage;
