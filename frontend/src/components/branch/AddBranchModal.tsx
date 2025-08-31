import React, { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import Modal from "@/components/inventory/Modal";
import { Branch } from "@/types/branches";

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBranch: (newBranch: Branch) => void;
  branches: Branch[];
}

const AddBranchModal: React.FC<AddBranchModalProps> = ({
  isOpen,
  onClose,
  onAddBranch,
  branches,
}) => {
  const [branchName, setBranchName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddBranch = async () => {
    if (!branchName.trim()) return;

    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      const newBranch: Branch = {
        id: (Math.max(...branches.map(b => parseInt(b.id))) + 1).toString(),
        name: branchName.trim(),
        managerCount: 0,
        staffCount: 0,
        managers: []
      };
      
      onAddBranch(newBranch);
      setBranchName("");
      setIsProcessing(false);
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    setBranchName("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Branch">
      <div className="space-y-4">
        <p className="text-gray-600">Enter the name for the new branch</p>

        {/* Branch Name Input */}
        <div className="relative">
          <Building2
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Enter branch name"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg 
                       focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg 
                       hover:bg-gray-200 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>

          <button
            onClick={handleAddBranch}
            disabled={!branchName.trim() || isProcessing}
            className="px-6 py-2 bg-[#3674B5] text-white rounded-lg 
                       transition-colors flex items-center gap-2 disabled:opacity-50 
                       hover:bg-[#2d5d91] font-medium"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddBranchModal;