import React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

interface LoadingStateProps {
  isLoading: boolean;
}

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

// Empty props interface - no props needed for LoginPrompt
type LoginPromptProps = Record<string, never>;

export const LoadingState: React.FC<LoadingStateProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 text-zeta animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    </div>
  );
};

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Error Loading Orders
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-zeta transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export const LoginPrompt: React.FC<LoginPromptProps> = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to view your orders.
        </p>
        <Link
          href="/"
          className="bg-zeta text-white px-6 py-2 rounded-lg transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};
