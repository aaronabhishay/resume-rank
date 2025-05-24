import React from "react";

const variants = {
  default: "bg-black text-white",
  secondary: "bg-gray-100 text-gray-900",
  outline: "border border-gray-300 bg-white text-gray-700",
};

export function Badge({ variant = "default", className = "", children, ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
} 