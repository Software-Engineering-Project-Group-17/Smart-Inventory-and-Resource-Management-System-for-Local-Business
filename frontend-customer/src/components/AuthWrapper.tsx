"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import CustomerInfoModal from "@/components/CustomerInfoModal";

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    customerData,
    showInfoModal,
    setShowInfoModal,
    updateCustomerInfo,
  } = useAuth();

  const handleSubmitCustomerInfo = async (data: {
    customer_tel: string;
    address: string;
  }) => {
    try {
      await updateCustomerInfo(data);
    } catch (error) {
      console.error("Error submitting customer info:", error);
      throw error;
    }
  };

  return (
    <>
      {children}

      {/* Customer Information Modal */}
      <CustomerInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        onSubmit={handleSubmitCustomerInfo}
        customerName={
          customerData?.customer_name || user?.displayName || "Customer"
        }
        customerEmail={customerData?.customer_email || user?.email || ""}
      />
    </>
  );
};

export default AuthWrapper;
