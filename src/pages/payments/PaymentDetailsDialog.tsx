// src/features/adminPayments/PaymentDetailsDialog.tsx
import * as React from "react";
import { X, Printer } from "lucide-react";
import { useGetAdminPaymentByIdQuery } from "@/state/adminApi";


function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB");
}

function formatCurrency(amount?: number) {
  if (amount == null) return "-";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface PaymentDetailsDialogProps {
  paymentId: string;
  onClose: () => void;
}

const PaymentDetailsDialog: React.FC<PaymentDetailsDialogProps> = ({
  paymentId,
  onClose,
}) => {
  const { data: payment, isLoading } = useGetAdminPaymentByIdQuery(paymentId);

  const sponsorName = React.useMemo(
    () =>
      `${payment?.sponsor?.firstName ?? ""} ${
        payment?.sponsor?.lastName ?? ""
      }`.trim(),
    [payment]
  );

  const scholarName = React.useMemo(
    () =>
      `${payment?.scholar?.profile?.personal?.firstName ?? ""} ${
        payment?.scholar?.profile?.personal?.lastName ?? ""
      }`.trim(),
    [payment]
  );

  const scholarPhone =
    payment?.scholar?.profile?.personal?.phone ??
    payment?.scholar?.phone ??
    payment?.scholar?.profile?.phone;

  const sponsorPhone = payment?.sponsor?.phone;

  const handlePrint = () => {
    // Simple: just trigger the browser print dialog.
    // If you want a print-only layout, you can wrap the card with a specific ID and use window.print()
    window.print();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl">
        {/* Close icon */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Payment Details
          </h2>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Printer className="h-3 w-3" />
            <span>Print</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {isLoading || !payment ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading…
            </div>
          ) : (
            <div className="space-y-6 text-xs text-slate-700">
              {/* ID row at top (blue pill like in Figma) */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">ID</span>
                  <span className="font-semibold text-blue-600">
                    {payment.reference}
                  </span>
                </div>
              </div>

              {/* Scholar details */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Scholar Details
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Name</span>
                    <span className="text-[11px] font-medium text-slate-800">
                      {scholarName || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Phone Number
                    </span>
                    <span className="text-[11px] font-medium text-slate-800">
                      {scholarPhone || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Email Address
                    </span>
                    <span className="max-w-[180px] truncate text-right text-[11px] font-medium text-slate-800">
                      {payment.scholar?.email || "-"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Sponsor details */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sponsor Details
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Name</span>
                    <span className="text-[11px] font-medium text-slate-800">
                      {sponsorName || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Phone Number
                    </span>
                    <span className="text-[11px] font-medium text-slate-800">
                      {sponsorPhone || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Email Address
                    </span>
                    <span className="max-w-[180px] truncate text-right text-[11px] font-medium text-slate-800">
                      {payment.sponsor?.email || "-"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Transaction details */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Transaction Details
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Date</span>
                    <span className="text-[11px] font-medium text-slate-800">
                      {formatDate(payment.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">ID</span>
                    <span className="text-[11px] font-medium text-slate-800">
                      {payment.reference}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Amount</span>
                    <span className="text-[11px] font-semibold text-slate-900">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Outstanding
                    </span>
                    <span className="text-[11px] font-semibold text-slate-900">
                      {formatCurrency(payment.outstanding)}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsDialog;
