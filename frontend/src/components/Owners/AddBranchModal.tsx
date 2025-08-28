import React from "react";
import { Building2, Plus } from "lucide-react";
import Modal from "./Modal";

type AddBranchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  branchName: string;
  setBranchName: (name: string) => void;
  handleAddBranch: () => void;
  isProcessing: boolean;
};

const AddBranchModal: React.FC<AddBranchModalProps> = ({
  isOpen,
  onClose,
  branchName,
  setBranchName,
  handleAddBranch,
  isProcessing,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Branch">
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
            onClick={onClose}
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
