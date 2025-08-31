"use client";
import React from "react";
import {
  Mail,
  User,
  Lock,
  Phone,
  MapPin,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { ManagerFormProps } from "./types";
import { MANAGER_CONSTANTS } from "./managerConstants";

export const CreateManagerForm: React.FC<ManagerFormProps> = ({
  formData,
  errors,
  showPassword,
  showConfirmPassword,
  onInputChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onGeneratePassword,
}) => {
  return (
    <div className="space-y-6">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <Mail size={16} className="inline mr-2" />
          {MANAGER_CONSTANTS.labels.email} *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={onInputChange}
          placeholder={MANAGER_CONSTANTS.placeholders.email}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
            errors.email
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-200 focus:ring-blue-500"
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.email}
          </p>
        )}
      </div>

      {/* First Name and Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <User size={16} className="inline mr-2" />
            {MANAGER_CONSTANTS.labels.firstName} *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            placeholder={MANAGER_CONSTANTS.placeholders.firstName}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
              errors.firstName
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-200 focus:ring-blue-500"
            }`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.firstName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <User size={16} className="inline mr-2" />
            {MANAGER_CONSTANTS.labels.lastName} *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            placeholder={MANAGER_CONSTANTS.placeholders.lastName}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
              errors.lastName
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-200 focus:ring-blue-500"
            }`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            <Lock size={16} className="inline mr-2" />
            {MANAGER_CONSTANTS.labels.password} *
          </label>
          <button
            type="button"
            onClick={onGeneratePassword}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {MANAGER_CONSTANTS.labels.generateRandom}
          </button>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={onInputChange}
            placeholder={MANAGER_CONSTANTS.placeholders.password}
            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
              errors.password
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-200 focus:ring-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <Lock size={16} className="inline mr-2" />
          {MANAGER_CONSTANTS.labels.confirmPassword} *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onInputChange}
            placeholder={MANAGER_CONSTANTS.placeholders.confirmPassword}
            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-1 focus:border-transparent transition-all duration-200 focus:outline-none ${
              errors.confirmPassword
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-200 focus:ring-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={onToggleConfirmPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <Phone size={16} className="inline mr-2" />
          {MANAGER_CONSTANTS.labels.phoneNumber}
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={onInputChange}
          placeholder={MANAGER_CONSTANTS.placeholders.phoneNumber}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:outline-none"
        />
      </div>

      {/* Address */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <MapPin size={16} className="inline mr-2" />
          {MANAGER_CONSTANTS.labels.address}
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={onInputChange}
          placeholder={MANAGER_CONSTANTS.placeholders.address}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
};
