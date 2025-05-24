import React, { createContext, useContext, useState } from "react";

const TabsContext = createContext({});

export function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className = "", ...props }) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined && onValueChange !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const setValue = isControlled ? onValueChange : setUncontrolledValue;

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = "", children, ...props }) {
  return (
    <div className={`flex space-x-1 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = "", ...props }) {
  const { value: selectedValue, setValue } = useContext(TabsContext);
  const isSelected = value === selectedValue;

  return (
    <button
      className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isSelected
          ? "bg-black text-white"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      } ${className}`}
      onClick={() => setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "", ...props }) {
  const { value: selectedValue } = useContext(TabsContext);
  if (value !== selectedValue) return null;

  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
} 