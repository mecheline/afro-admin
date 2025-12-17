import React from "react";

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
    {children}
  </span>
);
export default Chip;
