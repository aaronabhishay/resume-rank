import React from "react";

const variants = {
  default: "bg-black text-white hover:bg-gray-800",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
};

const sizes = {
  default: "px-4 py-2",
  sm: "px-3 py-1.5 text-sm",
  lg: "px-6 py-3 text-lg",
  icon: "p-2",
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  children,
  ...props
}) {
  return (
    <button
      className={`rounded-md font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 