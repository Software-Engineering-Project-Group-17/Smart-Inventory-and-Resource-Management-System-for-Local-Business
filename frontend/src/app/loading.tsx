import React from "react";
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="relative">
        {/* Main Loading Animation */}
        <div className="flex space-x-2 mb-8">
          <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-amber-700 rounded-full animate-bounce"></div>
        </div>

        {/* Spinning Ring */}
        <div className="absolute -top-8 -left-8 w-20 h-20 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-3">
        <h2 className="handwriting text-3xl font-medium text-amber-800">
          Our Inventory
        </h2>
        <p className="heebo font-light text-lg text-amber-700">
          Loading your experience...
        </p>
        <div className="flex items-center justify-center space-x-1">
          <span className="roboto-mono font-normal text-sm text-amber-600">
            Please wait
          </span>
          <div className="flex space-x-1">
            <span className="animate-ping inline-block w-1 h-1 bg-amber-500 rounded-full [animation-delay:0s]"></span>
            <span className="animate-ping inline-block w-1 h-1 bg-amber-500 rounded-full [animation-delay:0.2s]"></span>
            <span className="animate-ping inline-block w-1 h-1 bg-amber-500 rounded-full [animation-delay:0.4s]"></span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 w-64 h-2 bg-amber-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full animate-pulse"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-amber-300 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-orange-300 rounded-full opacity-10 animate-pulse [animation-delay:1s]"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-yellow-300 rounded-full opacity-10 animate-pulse [animation-delay:0.5s]"></div>
    </div>
  );
}
