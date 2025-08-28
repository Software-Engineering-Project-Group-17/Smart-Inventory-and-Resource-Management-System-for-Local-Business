import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import Modal from "./Modal";

// Shared Branch type (id is string)
type Branch = {
  id: string;
  name: string;
};

type DeleteBranchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  handleDeleteBranch: (branchId: string) => void;
  isProcessing: boolean;
};

const DeleteBranchModal: React.FC<DeleteBranchModalProps> = ({
  isOpen,
  onClose,
  branch,
  handleDeleteBranch,
  isProcessing,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Branch">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} className="text-red-500" />
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{branch?.name}</span>? This action
            cannot be undone.
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
            onClick={() => branch && handleDeleteBranch(branch.id)}
            disabled={isProcessing}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
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
