"use client"
import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Trash2,
  Check,
  X,
  UserPlus,
  Calendar,
  Mail,
  Phone,
  User,
  Clock,
  Target,
  Loader,
  Search
} from 'lucide-react';

interface Resource {
  id: number;
  name: string;
  details: string;
  isAvailable: boolean;
}

interface Assignment {
  id: number;
  resourceId: number;
  resourceName: string;
  email: string;
  staffName: string;
  phone: string;
  purpose: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

interface StaffMember {
  email: string;
  name: string;
  phone: string;
}

const ResourceTrackingPage = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'assigned'>('available');
  const [showAssignForm, setShowAssignForm] = useState<number | null>(null);
  const [showAddResourceForm, setShowAddResourceForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [resources, setResources] = useState<Resource[]>([
    {
      id: 1,
      name: 'Delivery Lorry - ABC-1234',
      details: 'Large delivery truck, 5-ton capacity, suitable for cement and bulk materials',
      isAvailable: true
    },
    {
      id: 2,
      name: 'Pickup Truck - XYZ-5678',
      details: 'Medium pickup truck, 2-ton capacity, ideal for tools and small deliveries',
      isAvailable: true
    },
    {
      id: 3,
      name: 'Van - DEF-9012',
      details: 'Cargo van, 1-ton capacity, perfect for hardware and equipment transport',
      isAvailable: false
    },
    {
      id: 4,
      name: 'Forklift - FL-001',
      details: 'Electric forklift, 3-ton lifting capacity, warehouse operations',
      isAvailable: true
    }
  ]);

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 1,
      resourceId: 3,
      resourceName: 'Van - DEF-9012',
      email: 'john.doe@example.com',
      staffName: 'John Doe',
      phone: '+94 77 123 4567',
      purpose: 'Customer delivery to Kandy region',
      startDate: '2025-08-27',
      endDate: '2025-08-28',
      startTime: '09:00',
      endTime: '17:00'
    }
  ]);

  // Mock database of staff members
  const staffDatabase: StaffMember[] = [
    { email: 'john.doe@example.com', name: 'John Doe', phone: '+94 77 123 4567' },
    { email: 'jane.smith@example.com', name: 'Jane Smith', phone: '+94 77 234 5678' },
    { email: 'mike.wilson@example.com', name: 'Mike Wilson', phone: '+94 77 345 6789' },
    { email: 'sarah.brown@example.com', name: 'Sarah Brown', phone: '+94 77 456 7890' },
    { email: 'david.lee@example.com', name: 'David Lee', phone: '+94 77 567 8901' }
  ];

  const [assignForm, setAssignForm] = useState({
    email: '',
    staffName: '',
    phone: '',
    purpose: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  });

  const [addResourceForm, setAddResourceForm] = useState({
    name: '',
    details: ''
  });

  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  const availableResources = resources.filter(resource => resource.isAvailable);
  const assignedResourceIds = assignments.map(a => a.resourceId);

  // Filter resources based on search query
  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter assignments based on search query
  const filteredAssignments = assignments.filter(assignment =>
    assignment.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchStaffDetails = async (email: string) => {
    if (!email || !email.includes('@')) return;
    
    setIsLoadingStaff(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const staffMember = staffDatabase.find(staff => 
        staff.email.toLowerCase() === email.toLowerCase()
      );
      
      if (staffMember) {
        setAssignForm(prev => ({
          ...prev,
          staffName: staffMember.name,
          phone: staffMember.phone
        }));
      } else {
        // Clear fields if staff not found
        setAssignForm(prev => ({
          ...prev,
          staffName: '',
          phone: ''
        }));
      }
      setIsLoadingStaff(false);
    }, 800);
  };

  const handleEmailChange = (email: string) => {
    setAssignForm(prev => ({ ...prev, email }));
    fetchStaffDetails(email);
  };

  const handleAddResource = () => {
    if (addResourceForm.name && addResourceForm.details) {
      const newResource: Resource = {
        id: Math.max(...resources.map(r => r.id), 0) + 1,
        name: addResourceForm.name,
        details: addResourceForm.details,
        isAvailable: true
      };
      
      setResources(prev => [...prev, newResource]);
      
      // Reset form
      setAddResourceForm({
        name: '',
        details: ''
      });
      setShowAddResourceForm(false);
      
      alert('Resource added successfully!');
    }
  };

  const handleAssign = (resourceId: number) => {
    if (assignForm.email && assignForm.purpose && assignForm.startDate && assignForm.endDate) {
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        const newAssignment: Assignment = {
          id: Math.max(...assignments.map(a => a.id), 0) + 1,
          resourceId,
          resourceName: resource.name,
          ...assignForm
        };
        setAssignments(prev => [...prev, newAssignment]);
        
        // Update resource availability
        setResources(prev => prev.map(r => 
          r.id === resourceId ? { ...r, isAvailable: false } : r
        ));
        
        alert(`${resource.name} has been assigned to ${assignForm.email}`);
        
        // Reset form
        setAssignForm({
          email: '',
          staffName: '',
          phone: '',
          purpose: '',
          startDate: '',
          endDate: '',
          startTime: '',
          endTime: ''
        });
        setShowAssignForm(null);
      }
    }
  };

  const handleUnassign = (assignmentId: number) => {
    if (confirm('Are you sure you want to unassign this resource?')) {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        // Update resource availability
        setResources(prev => prev.map(r => 
          r.id === assignment.resourceId ? { ...r, isAvailable: true } : r
        ));
        
        // Remove assignment
        setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      }
    }
  };

  const handleDeleteResource = (resourceId: number) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      // Remove any existing assignments for this resource
      setAssignments(prev => prev.filter(a => a.resourceId !== resourceId));
      
      // Remove the resource
      setResources(prev => prev.filter(r => r.id !== resourceId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-3 rounded-xl text-white"
              style={{ backgroundColor: "#3674B5" }}
            >
              <Truck size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resource Tracking</h1>
              <p className="text-gray-600">Manage and track your business resources</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#3674B5" }}>
                <Truck size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Resources</p>
                <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#10B981" }}>
                <Check size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{availableResources.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#FADA7A" }}>
                <UserPlus size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#3674B5" }}>
                <Target size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resources.length > 0 ? Math.round((assignments.length / resources.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-6 py-4 font-medium text-sm transition-colors duration-200 border-b-2 ${
                  activeTab === 'available'
                    ? 'border-[#3674B5] text-[#3674B5]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Resources ({resources.length})
              </button>
              <button
                onClick={() => setActiveTab('assigned')}
                className={`px-6 py-4 font-medium text-sm transition-colors duration-200 border-b-2 ${
                  activeTab === 'assigned'
                    ? 'border-[#3674B5] text-[#3674B5]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Assigned Resources ({assignments.length})
              </button>
            </div>
          </div>

          {/* All Resources Tab */}
          {activeTab === 'available' && (
            <div className="p-6">
              {/* Search Bar and Add Resource Button */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search resources by name or details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowAddResourceForm(!showAddResourceForm)}
                  className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center gap-2 font-medium"
                  style={{ backgroundColor: "#3674B5" }}
                >
                  <Plus size={20} />
                  Add Resource
                </button>
              </div>

              {/* Add Resource Form */}
              {showAddResourceForm && (
                <div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="p-2 rounded-lg text-white"
                      style={{ backgroundColor: "#10B981" }}
                    >
                      <Plus size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Add New Resource</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resource Name</label>
                      <input
                        type="text"
                        value={addResourceForm.name}
                        onChange={(e) => setAddResourceForm(prev => ({...prev, name: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                        placeholder="Enter resource name (e.g., Delivery Truck - ABC-123)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resource Details</label>
                      <input
                        type="text"
                        value={addResourceForm.details}
                        onChange={(e) => setAddResourceForm(prev => ({...prev, details: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                        placeholder="Enter resource details and specifications"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowAddResourceForm(false);
                        setAddResourceForm({ name: '', details: '' });
                      }}
                      className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddResource}
                      className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                      style={{ backgroundColor: "#10B981" }}
                      disabled={!addResourceForm.name || !addResourceForm.details}
                    >
                      <Plus size={16} />
                      Add Resource
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Resource Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Details</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredResources.map((resource) => (
                      <React.Fragment key={resource.id}>
                        <tr className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{resource.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600">{resource.details}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              resource.isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {resource.isAvailable ? 'Available' : 'Assigned'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setShowAssignForm(showAssignForm === resource.id ? null : resource.id)}
                                className="p-2 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                title="Assign Resource"
                              >
                                <UserPlus size={16} />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteResource(resource.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Resource"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Assignment Form Row */}
                        {showAssignForm === resource.id && (
                          <tr>
                            <td colSpan={4} className="px-6 py-6 bg-gray-50">
                              <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                  <div 
                                    className="p-2 rounded-lg text-white"
                                    style={{ backgroundColor: "#FADA7A" }}
                                  >
                                    <UserPlus size={20} />
                                  </div>
                                  <h3 className="text-lg font-semibold text-gray-800">
                                    Assign {resource.name}
                                  </h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Staff Email</label>
                                    <div className="relative">
                                      <input
                                        type="email"
                                        value={assignForm.email}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent pr-10"
                                        placeholder="Enter staff email"
                                      />
                                      {isLoadingStaff && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                          <Loader size={16} className="animate-spin text-[#3674B5]" />
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Staff Name</label>
                                    <input
                                      type="text"
                                      value={assignForm.staffName}
                                      readOnly
                                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                                      placeholder="Auto-filled from database"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                      type="tel"
                                      value={assignForm.phone}
                                      readOnly
                                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                                      placeholder="Auto-filled from database"
                                    />
                                  </div>

                                  <div className="md:col-span-2 lg:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                                    <textarea
                                      value={assignForm.purpose}
                                      onChange={(e) => setAssignForm(prev => ({...prev, purpose: e.target.value}))}
                                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                                      placeholder="Enter assignment purpose"
                                      rows={2}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                      type="date"
                                      value={assignForm.startDate}
                                      onChange={(e) => setAssignForm(prev => ({...prev, startDate: e.target.value}))}
                                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                      type="date"
                                      value={assignForm.endDate}
                                      onChange={(e) => setAssignForm(prev => ({...prev, endDate: e.target.value}))}
                                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="time"
                                        value={assignForm.startTime}
                                        onChange={(e) => setAssignForm(prev => ({...prev, startTime: e.target.value}))}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                                      />
                                      <span className="self-center text-gray-500">to</span>
                                      <input
                                        type="time"
                                        value={assignForm.endTime}
                                        onChange={(e) => setAssignForm(prev => ({...prev, endTime: e.target.value}))}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-3 justify-end mt-6">
                                  <button
                                    onClick={() => {
                                      setShowAssignForm(null);
                                      setAssignForm({
                                        email: '',
                                        staffName: '',
                                        phone: '',
                                        purpose: '',
                                        startDate: '',
                                        endDate: '',
                                        startTime: '',
                                        endTime: ''
                                      });
                                    }}
                                    className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleAssign(resource.id)}
                                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                                    style={{ backgroundColor: "#3674B5" }}
                                    disabled={!assignForm.email || !assignForm.staffName || !assignForm.purpose || !assignForm.startDate || !assignForm.endDate}
                                  >
                                    <Check size={16} />
                                    Assign Resource
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>

                {filteredResources.length === 0 && resources.length > 0 && (
                  <div className="text-center py-12">
                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No resources found</p>
                    <p className="text-gray-400">Try adjusting your search query</p>
                  </div>
                )}

                {resources.length === 0 && (
                  <div className="text-center py-12">
                    <Truck size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No resources available</p>
                    <p className="text-gray-400">Add resources to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assigned Resources Tab */}
          {activeTab === 'assigned' && (
            <div className="p-6">
              {/* Search Bar and Add Resource Button */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search assigned resources by name, purpose, or staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowAddResourceForm(!showAddResourceForm)}
                  className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center gap-2 font-medium"
                  style={{ backgroundColor: "#3674B5" }}
                >
                  <Plus size={20} />
                  Add Resource
                </button>
              </div>

              {/* Add Resource Form */}
              {showAddResourceForm && (
                <div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="p-2 rounded-lg text-white"
                      style={{ backgroundColor: "#10B981" }}
                    >
                      <Plus size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Add New Resource</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resource Name</label>
                      <input
                        type="text"
                        value={addResourceForm.name}
                        onChange={(e) => setAddResourceForm(prev => ({...prev, name: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                        placeholder="Enter resource name (e.g., Delivery Truck - ABC-123)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resource Details</label>
                      <input
                        type="text"
                        value={addResourceForm.details}
                        onChange={(e) => setAddResourceForm(prev => ({...prev, details: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                        placeholder="Enter resource details and specifications"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowAddResourceForm(false);
                        setAddResourceForm({ name: '', details: '' });
                      }}
                      className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddResource}
                      className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                      style={{ backgroundColor: "#10B981" }}
                      disabled={!addResourceForm.name || !addResourceForm.details}
                    >
                      <Plus size={16} />
                      Add Resource
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Resource Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Purpose</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Staff Details</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time Range</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAssignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{assignment.resourceName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">{assignment.purpose}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-gray-400" />
                              <span className="text-gray-900 font-medium">{assignment.staffName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-gray-400" />
                              <span className="text-gray-600 text-sm">{assignment.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-gray-400" />
                              <span className="text-gray-600 text-sm">{assignment.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar size={14} />
                              <span>{assignment.startDate} - {assignment.endDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{assignment.startTime} - {assignment.endTime}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleUnassign(assignment.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Unassign Resource"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {assignments.length === 0 && (
                  <div className="text-center py-12">
                    <Truck size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No assigned resources</p>
                    <p className="text-gray-400">Resources will appear here when assigned</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResourceTrackingPage;