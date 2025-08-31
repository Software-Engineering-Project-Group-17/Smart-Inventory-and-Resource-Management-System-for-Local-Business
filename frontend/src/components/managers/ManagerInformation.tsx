"use client";
import React from "react";
import { MANAGER_CONSTANTS } from "./managerConstants";

export const ManagerInformation: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <h3 className="font-medium text-amber-900 mb-2">
        Important Information:
      </h3>
      <ul className="text-sm text-amber-800 space-y-1">
        {MANAGER_CONSTANTS.info.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
};
