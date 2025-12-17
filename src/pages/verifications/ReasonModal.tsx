// components/ReasonModal.tsx
import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (reason: string) => void | Promise<void>;
}

const ReasonModal: React.FC<Props> = ({ open, onClose, onSave }) => {
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-base font-semibold text-gray-900">
          Reason for rejection
        </h2>
        <p className="mb-3 text-xs text-gray-500">
          Provide a brief explanation for rejecting this scholar&apos;s
          documents. This will be visible to the sponsor/scholar.
        </p>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Enter reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            className="rounded-full bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            disabled={!reason.trim()}
            onClick={() => onSave(reason)}
          >
            Save & Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasonModal;
