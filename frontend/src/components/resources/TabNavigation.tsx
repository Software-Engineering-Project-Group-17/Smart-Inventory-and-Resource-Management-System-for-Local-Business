import React from 'react';

interface TabNavigationProps {
  activeTab: 'available' | 'assigned';
  onTabChange: (tab: 'available' | 'assigned') => void;
  resourcesCount: number;
  assignmentsCount: number;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  resourcesCount,
  assignmentsCount
}) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex">
        <button
          onClick={() => onTabChange('available')}
          className={`px-6 py-4 font-medium text-sm transition-colors duration-200 border-b-2 ${
            activeTab === 'available'
              ? 'border-[#3674B5] text-[#3674B5]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All Resources ({resourcesCount})
        </button>
        <button
          onClick={() => onTabChange('assigned')}
          className={`px-6 py-4 font-medium text-sm transition-colors duration-200 border-b-2 ${
            activeTab === 'assigned'
              ? 'border-[#3674B5] text-[#3674B5]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Assigned Resources ({assignmentsCount})
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;