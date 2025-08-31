import React from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  id: string;
  name: string;
}

interface DropdownProps {
  value: string;
  placeholder: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  showAddNew?: boolean;
  onAddNew?: () => void;
  addNewLabel?: string;
  minWidth?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  value,
  placeholder,
  options,
  onSelect,
  isOpen,
  onToggle,
  showAddNew = false,
  onAddNew,
  addNewLabel = "+ Add New",
  minWidth = "150px"
}) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent flex items-center justify-between"
        style={{ minWidth }}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <ChevronDown size={20} className="text-gray-400 ml-2" />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {options.map(option => (
              <button
                key={option.id}
                onClick={() => {
                  onSelect(option.name);
                  onToggle();
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                {option.name}
              </button>
            ))}
            {showAddNew && onAddNew && (
              <div className="border-t border-gray-200">
                <button
                  onClick={() => {
                    onToggle();
                    onAddNew();
                  }}
                  className="w-full px-4 py-3 text-left text-[#3674B5] hover:bg-gray-50 transition-colors font-medium"
                >
                  {addNewLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;