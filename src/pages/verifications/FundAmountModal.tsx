import React from "react";
import { toast } from "sonner";

export const FundAmountModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  isSubmitting: boolean;
}> = ({ open, onClose, onConfirm, isSubmitting }) => {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!open) setValue("");
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    const raw = value.replace(/,/g, "");
    const amount = Number(raw);

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    onConfirm(amount);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
        <h2 className="mb-2 text-sm font-semibold text-gray-800">
          Fund Scholar
        </h2>
        <p className="mb-3 text-xs text-gray-500">
          Enter the amount you want to transfer to this scholar.
        </p>
        <div className="mb-4 flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5">
          <span className="text-xs font-semibold text-gray-500">₦</span>
          <input
            type="number"
            min={1}
            step="0.01"
            className="w-full border-none bg-transparent text-sm outline-none"
            placeholder="0.00"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 text-sm">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-gray-700"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Funding…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};
