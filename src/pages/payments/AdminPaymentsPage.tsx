// src/features/adminPayments/AdminPaymentsPage.tsx
import * as React from "react";
import { Loader2 } from "lucide-react";
import { useGetAdminPaymentsQuery } from "@/state/adminApi";
import PaymentDetailsDialog from "./PaymentDetailsDialog";

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB"); // dd/mm/yyyy
}

function formatCurrency(amount?: number) {
  if (amount == null) return "-";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

const PAGE_SIZE = 10;

const AdminPaymentsPage: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [selectedPaymentId, setSelectedPaymentId] = React.useState<
    string | null
  >(null);
  const [rows, setRows] = React.useState<any[]>([]);

  const { data, isLoading, isFetching } = useGetAdminPaymentsQuery({
    page,
    pageSize: PAGE_SIZE,
  });

  // Merge pages when "Load more" is clicked
  React.useEffect(() => {
    if (!data?.items) return;
    setRows((prev) => {
      const byId = new Map(prev.map((p) => [p._id, p]));
      data.items.forEach((item) => {
        byId.set(item._id, item);
      });
      return Array.from(byId.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [data?.items]);

  const totalCount = data?.totalCount ?? 0;
  const canLoadMore = rows.length < totalCount;

  const handleLoadMore = () => {
    if (canLoadMore && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedPaymentId(id);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Payments</h1>
      </div>

      {/* Main card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Card header row */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Payment</h2>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
            <span className="text-xs font-medium text-slate-500">Payments</span>
            <span className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-semibold text-white">
              {totalCount}
            </span>
          </div>
        </div>

        {/* Table wrapper */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-b border-slate-200">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Sponsor Name</th>
                <th className="px-6 py-3">Scholar Name</th>
                <th className="px-6 py-3">Scholarship Title</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Outstanding Amount</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span>Loading payments…</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No payments yet.
                  </td>
                </tr>
              )}

              {rows.map((payment) => {
                const sponsorName = `${payment.sponsor?.firstName ?? ""} ${
                  payment.sponsor?.lastName ?? ""
                }`.trim();

                const scholarName = `${
                  payment.scholar?.profile?.personal?.firstName ?? ""
                } ${payment.scholar?.profile?.personal?.lastName ?? ""}`.trim();

                return (
                  <tr key={payment._id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3 align-middle text-xs font-semibold text-slate-900">
                      {payment.reference}
                    </td>
                    <td className="px-6 py-3 align-middle text-xs text-slate-700">
                      {sponsorName || "-"}
                    </td>
                    <td className="px-6 py-3 align-middle text-xs text-slate-700">
                      {scholarName || "-"}
                    </td>
                    <td className="px-6 py-3 align-middle text-xs text-slate-700">
                      {payment.scholarshipTitle || "-"}
                    </td>
                    <td className="px-6 py-3 align-middle text-xs text-slate-700">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-3 align-middle text-right text-xs font-semibold text-emerald-600">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-3 align-middle text-right text-xs font-semibold text-slate-700">
                      {formatCurrency(payment.outstanding)}
                    </td>
                    <td className="px-6 py-3 align-middle text-right text-xs">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(payment._id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Card footer with Load more */}
        <div className="border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-center">
            {canLoadMore ? (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isFetching}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {isFetching ? "Loading…" : "Load more"}
              </button>
            ) : (
              <span className="text-xs text-slate-400">
                Showing {rows.length} of {totalCount} payments
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Payment details modal */}
      {selectedPaymentId && (
        <PaymentDetailsDialog
          paymentId={selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
        />
      )}
    </div>
  );
};

export default AdminPaymentsPage;
