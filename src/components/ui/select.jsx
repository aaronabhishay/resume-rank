import React, { useState, useRef, useEffect, cloneElement, Children } from "react";

export function Select({ value, onChange, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Inject props into children
  return (
    <div className="relative" ref={ref}>
      {Children.map(children, (child) => {
        if (!child) return null;
        if (child.type.displayName === "SelectTrigger") {
          return cloneElement(child, {
            onClick: () => setOpen((o) => !o),
            value,
          });
        }
        if (child.type.displayName === "SelectContent" && open) {
          return cloneElement(child, {
            onSelect: (val) => {
              onChange(val);
              setOpen(false);
            },
            value,
          });
        }
        return null;
      })}
    </div>
  );
}

export function SelectTrigger({ children, onClick }) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({ placeholder, value, options }) {
  let selected = null;
  if (options) {
    selected = options.find((opt) => opt.props.value === value);
  }
  return <span>{selected ? selected.props.children : placeholder}</span>;
}
SelectValue.displayName = "SelectValue";

export function SelectContent({ children, onSelect }) {
  return (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
      {Children.map(children, (child) =>
        child ? cloneElement(child, { onSelect }) : null
      )}
    </div>
  );
}
SelectContent.displayName = "SelectContent";

export function SelectItem({ value, children, onSelect }) {
  return (
    <button
      type="button"
      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100"
      onClick={() => onSelect(value)}
    >
      {children}
    </button>
  );
}
SelectItem.displayName = "SelectItem"; 