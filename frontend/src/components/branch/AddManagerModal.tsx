import React, { useState } from "react";
import { Check, Mail } from "lucide-react";
import Modal from "@/components/inventory/Modal";
import { Branch } from "@/types/branches";

interface AddManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBranch: Branch | null;
  onAddManager: (branchId: string, email: string) => void;
}

const AddManagerModal: React.FC<AddManagerModalProps> = ({
  isOpen,
  onClose,
  selectedBranch,
  onAddManager,
}) => {
  const [managerEmail, setManagerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddManager = async () => {
    if (!managerEmail || !managerEmail.includes("@") || !selectedBranch) return;

    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      onAddManager(selectedBranch.id, managerEmail);
      setManagerEmail("");
      setIsProcessing(false);
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    setManagerEmail("");
    onClose();
  };

  if (!selectedBranch) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Manager">
      <div className="space-y-4">
        <p className="text-gray-600">
          Add a new manager to{" "}
          <span className="font-semibold">{selectedBranch.name}</span>
        </p>

        {/* Email Input */}
        <div className="relative">
          <Mail
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="email"
            placeholder="Enter manager's email"
            value={managerEmail}
            onChange={(e) => setManagerEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg 
                       focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg 
                       hover:bg-gray-200 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>

          <button
            onClick={handleAddManager}
            disabled={
              !managerEmail || !managerEmail.includes("@") || isProcessing
            }
            className="px-4 py-2 bg-[#3674B5] text-white rounded-lg 
                       transition-colors flex items-center gap-2 disabled:opacity-50 
                       hover:bg-[#2d5d91]"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <Check size={16} />
                Done
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddManagerModal;