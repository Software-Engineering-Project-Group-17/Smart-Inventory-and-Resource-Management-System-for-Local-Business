import React from 'react';
import { Truck, Check, UserPlus, Target } from 'lucide-react';
import { Resource, Assignment } from '@/types/Resources';

interface SummaryCardsProps {
  resources: Resource[];
  assignments: Assignment[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ resources, assignments }) => {
  const availableResources = resources.filter(resource => resource.isAvailable);
  
  return (
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
  );
};

export default SummaryCards;