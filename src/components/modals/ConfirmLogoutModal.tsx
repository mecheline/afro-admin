import * as React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void | Promise<void>;
  isLoading?: boolean;
};

export default function ConfirmLogoutModal({
  open,
  onClose,
  onContinue,
  isLoading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-[15px] font-semibold text-gray-900">
          Confirm logout
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          You’ll be signed out of your admin account. Do you want to continue?
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onContinue}
            disabled={isLoading}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isLoading ? "Signing out..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
