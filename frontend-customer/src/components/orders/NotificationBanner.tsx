import React from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface NotificationBannerProps {
  type: "success" | "error";
  message: string;
  description?: string;
  onClose: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  type,
  message,
  description,
  onClose,
}) => {
  const isSuccess = type === "success";
  const bgColor = isSuccess ? "bg-green-50" : "bg-red-50";
  const borderColor = isSuccess ? "border-green-200" : "border-red-200";
  const textColor = isSuccess ? "text-green-800" : "text-red-800";
  const descriptionColor = isSuccess ? "text-green-700" : "text-red-700";
  const iconColor = isSuccess ? "text-green-600" : "text-red-600";
  const buttonColor = isSuccess
    ? "text-green-600 hover:text-green-700"
    : "text-red-600 hover:text-red-700";

  return (
    <div className={`mb-6 ${bgColor} border ${borderColor} rounded-lg p-4`}>
      <div className="flex items-center gap-3">
        {isSuccess ? (
          <CheckCircle className={`w-6 h-6 ${iconColor}`} />
        ) : (
          <AlertCircle className={`w-6 h-6 ${iconColor}`} />
        )}
        <div>
          <p className={`${textColor} font-medium`}>{message}</p>
          {description && (
            <p className={`${descriptionColor} text-sm`}>{description}</p>
          )}
        </div>
        <button onClick={onClose} className={`ml-auto ${buttonColor}`}>
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;
