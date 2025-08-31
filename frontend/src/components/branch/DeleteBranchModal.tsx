import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import Modal from "@/components/inventory/Modal";
import { Branch } from "@/types/branches";

interface DeleteBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBranch: Branch | null;
  onDeleteBranch: (branchId: string) => void;
}

const DeleteBranchModal: React.FC<DeleteBranchModalProps> = ({
  isOpen,
  onClose,
  selectedBranch,
  onDeleteBranch,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeleteBranch = async () => {
    if (!selectedBranch) return;

    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      onDeleteBranch(selectedBranch.id);
      setIsProcessing(false);
      onClose();
    }, 1000);
  };

  if (!selectedBranch) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Branch">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} className="text-red-500" />
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{selectedBranch.name}</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteBranch}
            disabled={isProcessing}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteBranchModal;