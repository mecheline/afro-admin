// src/pages/Sponsors/ScholarDetailsModal.tsx
import React from "react";
import {
  useGetScholarOverviewQuery,
  useUpdateScholarStatussMutation,
} from "@/state/adminApi";
// simple classname utility to avoid missing module error
const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type Props = {
  scholarId: string;
  open: boolean;
  onClose: () => void;
};

const ScholarDetailsModal: React.FC<Props> = ({ scholarId, open, onClose }) => {
  const { data, isLoading } = useGetScholarOverviewQuery(scholarId, {
    skip: !open,
  });
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateScholarStatussMutation();

  const scholar = data?.data;

  if (!open) return null;

  const handleDeactivate = async () => {
    await updateStatus({
      scholarId,
      status: "Inactive",
      reason: "Deactivated from Sponsors module",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          ×
        </button>

        {isLoading || !scholar ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading scholar details…
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Scholars Details
              </h2>
              <button className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
                Send Email
              </button>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-slate-200" />
              <div className="text-sm font-semibold text-slate-900">
                {scholar.fullName}
              </div>
              <div className="text-xs text-slate-500">{scholar.phone}</div>
              <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-700">
                ID-9081HSJ
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <InfoRow label="Date of Birth">
                {scholar.dateOfBirth
                  ? new Date(scholar.dateOfBirth).toLocaleDateString("en-GB")
                  : "-"}
              </InfoRow>
              <InfoRow label="Age">26 years old</InfoRow>
              <InfoRow label="Email">{scholar.email}</InfoRow>
              <InfoRow label="Phone Number">{scholar.phone}</InfoRow>
            </div>

            {/* Totals grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <StatCard label="Total Disbursed">
                ₦{(scholar.totals?.totalDisbursed || 0).toLocaleString()}
              </StatCard>
              <StatCard label="Outstanding Amount">
                ₦{(scholar.totals?.outstandingAmount || 0).toLocaleString()}
              </StatCard>
            </div>

            {/* Payments list */}
            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold text-slate-900">
                Payments
              </div>
              <div className="space-y-2 text-xs">
                {scholar.payments?.map((p: any) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <div className="font-medium text-slate-900">
                      ₦{(p.amount || 0).toLocaleString()}
                    </div>
                    <button className="text-[11px] font-medium text-indigo-600">
                      View receipt
                    </button>
                  </div>
                ))}
                {(!scholar.payments || scholar.payments.length === 0) && (
                  <div className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-[11px] text-slate-500">
                    No payments yet.
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleDeactivate}
                disabled={isUpdating}
                className={cn(
                  "flex h-11 w-full items-center justify-center rounded-lg bg-rose-600 text-sm font-semibold text-white",
                  isUpdating && "opacity-70"
                )}
              >
                {isUpdating ? "Deactivating…" : "Deactivate User"}
              </button>
              <button
                onClick={onClose}
                className="flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-700"
              >
                Go back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-left">
    <div className="text-[10px] text-slate-400">{label}</div>
    <div className="mt-1 text-xs font-semibold text-slate-900">{children}</div>
  </div>
);

const StatCard: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left">
    <div className="text-[10px] text-slate-400">{label}</div>
    <div className="mt-1 text-xs font-semibold text-slate-900">{children}</div>
  </div>
);

export default ScholarDetailsModal;
