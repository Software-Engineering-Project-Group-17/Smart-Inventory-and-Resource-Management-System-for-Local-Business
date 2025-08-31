import React, { useState } from "react";
import { User, Mail, Phone, MapPin, Edit, Save, X, UserCheck } from "lucide-react";
import { Profile, Role } from "@/types/profile";
import { getTypeColor, getTypeName, getTypeInitials } from "@/services/profileConstants";

interface ProfileInfoCardProps {
  profile: Profile;
  role: Role;
  userType: string[];
  onSave: (updatedProfile: Profile) => void;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  profile,
  role,
  userType,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({ ...profile });

  const handleEdit = () => {
    setIsEditing(true);
    setEditProfile({ ...profile });
  };

  const handleSave = () => {
    onSave(editProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile({ ...profile });
    setIsEditing(false);
  };

  return (
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
  );
};

export default ProfileInfoCard;