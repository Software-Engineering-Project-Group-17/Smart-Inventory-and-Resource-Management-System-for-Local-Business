import React from 'react';
import { Search, Truck } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-results' | 'no-resources' | 'no-assignments';
  searchQuery?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, searchQuery }) => {
  if (type === 'no-results') {
    return (
      <div className="text-center py-12">
        <Search size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">No resources found</p>
        <p className="text-gray-400">Try adjusting your search query</p>
      </div>
    );
  }

  if (type === 'no-resources') {
    return (
      <div className="text-center py-12">
        <Truck size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">No resources available</p>
        <p className="text-gray-400">Add resources to get started</p>
      </div>
    );
  }

  if (type === 'no-assignments') {
    return (
      <div className="text-center py-12">
        <Truck size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">No assigned resources</p>
        <p className="text-gray-400">Resources will appear here when assigned</p>
      </div>
    );
  }

  return null;
};

export default EmptyState;