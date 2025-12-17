import React from "react";

export const StatusBadge: React.FC<{ status: "Active" | "Inactive" }> = ({
  status,
}) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
      status === "Active"
        ? "bg-green-50 text-green-700"
        : "bg-red-50 text-red-600"
    }`}
  >
    <span
      className={`h-2 w-2 rounded-full ${
        status === "Active" ? "bg-green-500" : "bg-red-500"
      }`}
    />
    {status}
  </span>
);
