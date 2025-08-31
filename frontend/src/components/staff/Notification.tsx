import React from "react";
import { Check, X } from "lucide-react";
import { NotificationState } from "./types";

interface NotificationProps {
  notification: NotificationState;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  notification,
  onClose,
}) => {
  if (!notification.show) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
        notification.type === "success"
          ? "bg-green-50 border-green-400 text-green-800"
          : "bg-red-50 border-red-400 text-red-800"
      } max-w-md`}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {notification.type === "success" ? (
            <Check className="h-5 w-5 text-green-400" />
          ) : (
            <X className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
