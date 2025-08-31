import React from 'react';
import { Check } from 'lucide-react';
import Modal from '@/components/inventory/Modal';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  onCategoryNameChange: (name: string) => void;
  onAddCategory: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryName,
  onCategoryNameChange,
  onAddCategory
}) => {
  const handleClose = () => {
    onClose();
    onCategoryNameChange('');
  };

  const handleAdd = () => {
    if (categoryName.trim()) {
      onAddCategory();
      handleClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Category">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => onCategoryNameChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            placeholder="Enter category name"
            autoFocus
          />
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!categoryName.trim()}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#3674B5" }}
          >
            <Check size={16} />
            Add Category
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddCategoryModal;