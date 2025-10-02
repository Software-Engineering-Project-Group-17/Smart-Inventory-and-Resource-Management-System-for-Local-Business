"use client";

import React, { useState } from "react";
import { X, Phone, MapPin, User } from "lucide-react";

interface CustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { customer_tel: string; address: string }) => Promise<void>;
  customerName?: string;
  customerEmail?: string;
}

const CustomerInfoModal: React.FC<CustomerInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customerName,
  customerEmail,
}) => {
  const [formData, setFormData] = useState({
    customer_tel: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.customer_tel.trim()) {
      newErrors.customer_tel = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.customer_tel)) {
      newErrors.customer_tel = "Please enter a valid phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ customer_tel: "", address: "" });
      onClose();
    } catch (error) {
      console.error("Error submitting customer info:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-zeta" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                You are almost there...
              </h2>
              <p className="text-sm text-gray-500">
                Please add your contact information
              </p>
            </div>
          </div>
          {/* <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button> */}
        </div>

        {/* Customer Info Display */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">{customerName}</p>
            <p className="text-gray-500">{customerEmail}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.customer_tel}
              onChange={(e) =>
                handleInputChange("customer_tel", e.target.value)
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-zeta focus:border-zeta transition-colors ${
                errors.customer_tel ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="+1 (555) 123-4567"
              disabled={isSubmitting}
            />
            {errors.customer_tel && (
              <p className="mt-1 text-sm text-red-600">{errors.customer_tel}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-zeta focus:border-zeta transition-colors resize-none ${
                errors.address ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter your complete address..."
              disabled={isSubmitting}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>Why do we need this?</strong>
              <br />
              This information helps us process your orders, in-store shopping
              and deliver products to your location.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {/* <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Skip for Now
            </button> */}
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-zeta text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Information"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerInfoModal;
