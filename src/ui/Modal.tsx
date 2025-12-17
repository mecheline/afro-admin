import React from "react";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  primary?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "danger";
  };
  cancelLabel?: string;
  children?: React.ReactNode;
  widthClass?: string;
};

const Modal: React.FC<Props> = ({
  open,
  title,
  description,
  onClose,
  primary,
  cancelLabel = "Cancel",
  children,
  widthClass = "max-w-lg",
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div
        className={`relative mx-4 w-full ${widthClass} rounded-2xl bg-white p-6 shadow-xl`}
      >
        {title && (
          <h3 className="text-center text-xl font-semibold text-blue-600">
            {title}
          </h3>
        )}
        {description && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {description}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex flex-col gap-3">
          {primary && (
            <button
              onClick={primary.onClick}
              className={`h-11 rounded-xl font-semibold text-white ${
                primary.variant === "danger"
                  ? "bg-red-600 hover:bg-red-600/90"
                  : "bg-blue-600 hover:bg-blue-600/90"
              }`}
            >
              {primary.label}
            </button>
          )}
          <button
            onClick={onClose}
            className="h-11 rounded-xl bg-blue-50 font-semibold text-blue-700 hover:bg-blue-50/80"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
