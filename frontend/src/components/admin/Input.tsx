"use client";
import React, { useState } from "react";

interface InputProps {
  name: string;
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  name,
  type,
  value = "",
  onChange,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative w-full">
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className={`
          w-full pt-6 pb-2 bg-transparent border-b-2 transition-all duration-300 
          focus:outline-none
          ${
            isFocused
              ? "border-secondaryColor"
              : "border-primaryColor hover:borderSecondaryColor"
          }
        `}
      />

      <label
        htmlFor={name}
        className={`
          absolute left-0 transition-all duration-300 ease-in-out pointer-events-none
          font-medium capitalize cursor-text heebo
          ${
            isFloating
              ? "top-0 text-xs text-primaryColor transform -translate-y-1"
              : "top-3 text-[16px] text-secondaryColor"
          }
          ${
            isFocused
              ? "text-blue-500"
              : isFloating
              ? "text-gray-600"
              : "text-gray-500"
          }
        `}
      >
        {name}
      </label>
    </div>
  );
};

export default Input;
