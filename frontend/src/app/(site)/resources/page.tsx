"use client"
import React, { useState } from 'react';
import { Resource, Assignment } from '@/types/Resources';
import { fetchStaffDetails } from '@/services/staffService';
import Header from '@/components/resources/Header';
import SummaryCards from '@/components/resources/SummaryCards';
import TabNavigation from '@/components/resources/TabNavigation';
import SearchBar from '@/components/resources/SearchBar';
import AddResourceForm from '@/components/resources/AddResourceForm';
import ResourcesTable from '@/components/resources/ResourcesTable';
import AssignmentsTable from '@/components/resources/AssignmentsTable';
import EmptyState from '@/components/resources/EmptyState';

const ResourceTrackingPage = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'assigned'>('available');
  const [showAssignForm, setShowAssignForm] = useState<string | null>(null);
  const [showAddResourceForm, setShowAddResourceForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [resources, setResources] = useState<Resource[]>([
    {
      id: '1',
      name: 'Delivery Lorry - ABC-1234',
      details: 'Large delivery truck, 5-ton capacity, suitable for cement and bulk materials',
      isAvailable: true
    },
    {
      id: '2',
      name: 'Pickup Truck - XYZ-5678',
      details: 'Medium pickup truck, 2-ton capacity, ideal for tools and small deliveries',
      isAvailable: true
    },
    {
      id: '3',
      name: 'Van - DEF-9012',
      details: 'Cargo van, 1-ton capacity, perfect for hardware and equipment transport',
      isAvailable: false
    },
    {
      id: '4',
      name: 'Forklift - FL-001',
      details: 'Electric forklift, 3-ton lifting capacity, warehouse operations',
      isAvailable: true
    }
  ]);

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      resourceId: '3',
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

  const handleEmailChange = async (email: string) => {
    setAssignForm(prev => ({ ...prev, email }));
    
    if (!email || !email.includes('@')) return;
    
    setIsLoadingStaff(true);
    
    try {
      const staffMember = await fetchStaffDetails(email);
      
      if (staffMember) {
        setAssignForm(prev => ({
          ...prev,
          staffName: staffMember.name,
          phone: staffMember.phone
        }));
      } else {
        setAssignForm(prev => ({
          ...prev,
          staffName: '',
          phone: ''
        }));
      }
    } catch (error) {
      console.error('Error fetching staff details:', error);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleAddResource = () => {
    if (addResourceForm.name && addResourceForm.details) {
      const maxId = Math.max(...resources.map(r => parseInt(r.id)), 0);
      const newResource: Resource = {
        id: (maxId + 1).toString(),
        name: addResourceForm.name,
        details: addResourceForm.details,
        isAvailable: true
      };
      
      setResources(prev => [...prev, newResource]);
      
      setAddResourceForm({
        name: '',
        details: ''
      });
      setShowAddResourceForm(false);
      
      alert('Resource added successfully!');
    }
  };

  const handleAssign = (resourceId: string) => {
    if (assignForm.email && assignForm.purpose && assignForm.startDate && assignForm.endDate) {
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        const maxId = Math.max(...assignments.map(a => parseInt(a.id)), 0);
        const newAssignment: Assignment = {
          id: (maxId + 1).toString(),
          resourceId,
          resourceName: resource.name,
          ...assignForm
        };
        setAssignments(prev => [...prev, newAssignment]);
        
        setResources(prev => prev.map(r => 
          r.id === resourceId ? { ...r, isAvailable: false } : r
        ));
        
        alert(`${resource.name} has been assigned to ${assignForm.email}`);
        
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

  const handleUnassign = (assignmentId: string) => {
    if (confirm('Are you sure you want to unassign this resource?')) {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        setResources(prev => prev.map(r => 
          r.id === assignment.resourceId ? { ...r, isAvailable: true } : r
        ));
        
        setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      }
    }
  };

  const handleDeleteResource = (resourceId: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      setAssignments(prev => prev.filter(a => a.resourceId !== resourceId));
      setResources(prev => prev.filter(r => r.id !== resourceId));
    }
  };

  const handleAssignFormCancel = () => {
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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        <SummaryCards resources={resources} assignments={assignments} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            resourcesCount={resources.length}
            assignmentsCount={assignments.length}
          />

          {activeTab === 'available' && (
            <div className="p-6">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddResourceClick={() => setShowAddResourceForm(!showAddResourceForm)}
                placeholder="Search resources by name or details..."
              />

              <AddResourceForm
                showForm={showAddResourceForm}
                formData={addResourceForm}
                onFormDataChange={setAddResourceForm}
                onSubmit={handleAddResource}
                onCancel={() => {
                  setShowAddResourceForm(false);
                  setAddResourceForm({ name: '', details: '' });
                }}
              />

              {filteredResources.length > 0 ? (
                <ResourcesTable
                  resources={filteredResources}
                  showAssignForm={showAssignForm}
                  assignForm={assignForm}
                  isLoadingStaff={isLoadingStaff}
                  onShowAssignForm={setShowAssignForm}
                  onAssignFormChange={setAssignForm}
                  onEmailChange={handleEmailChange}
                  onAssign={handleAssign}
                  onDeleteResource={handleDeleteResource}
                  onAssignFormCancel={handleAssignFormCancel}
                />
              ) : (
                <EmptyState 
                  type={resources.length > 0 ? 'no-results' : 'no-resources'} 
                  searchQuery={searchQuery}
                />
              )}
            </div>
          )}

          {activeTab === 'assigned' && (
            <div className="p-6">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddResourceClick={() => setShowAddResourceForm(!showAddResourceForm)}
                placeholder="Search assigned resources by name, purpose, or staff..."
              />

              <AddResourceForm
                showForm={showAddResourceForm}
                formData={addResourceForm}
                onFormDataChange={setAddResourceForm}
                onSubmit={handleAddResource}
                onCancel={() => {
                  setShowAddResourceForm(false);
                  setAddResourceForm({ name: '', details: '' });
                }}
              />

              {filteredAssignments.length > 0 ? (
                <AssignmentsTable
                  assignments={filteredAssignments}
                  onUnassign={handleUnassign}
                />
              ) : (
                <EmptyState type="no-assignments" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceTrackingPage;