import React from "react";
import { Mail, UserMinus } from "lucide-react";
import Modal from "./Modal";



type Branch = {
  id: string; 
  name: string;
  managers: string[];
};

type RemoveManagerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  selectedManagerEmail: string;
  setSelectedManagerEmail: (email: string) => void;
  handleRemoveManager: (branchId: string) => void; // also number here
  isProcessing: boolean;
};


const RemoveManagerModal: React.FC<RemoveManagerModalProps> = ({
  isOpen,
  onClose,
  branch,
  selectedManagerEmail,
  setSelectedManagerEmail,
  handleRemoveManager,
  isProcessing,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Remove Manager"
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Select a manager to remove from{" "}
          <span className="font-semibold">{branch?.name}</span>:
        </p>

        {/* Manager Selection */}
        <div className="space-y-2">
          {branch?.managers.map((email, index) => (
            <label
              key={index}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="managerEmail"
                value={email}
                checked={selectedManagerEmail === email}
                onChange={(e) => setSelectedManagerEmail(e.target.value)}
                className="text-[#3674B5] focus:ring-[#3674B5]"
              />
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-700">{email}</span>
            </label>
          ))}
        </div>

        {branch && branch.managers.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No managers to remove
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={() => branch && handleRemoveManager(branch.id)}
            disabled={!selectedManagerEmail || isProcessing}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Removing...
              </>
            ) : (
              <>
                <UserMinus size={16} />
                Remove
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RemoveManagerModal;
