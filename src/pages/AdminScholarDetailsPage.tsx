// features/scholars/AdminScholarDetailsPage.tsx
"use client";

import * as React from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import {
  useGetScholarByIdQuery,
  useUpdateScholarStatusMutation,
  useGetScholarScholarshipsQuery,
  type AdminScholar,
  type AdminScholarScholarship,
  type PageMeta,
} from "@/state/adminApi";

type TabKey = "details" | "scholarships" | "transactions";

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function currency(amount: number, currencyCode = "NGN") {
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

function planSuffix(plan?: AdminScholarScholarship["plan"]) {
  switch (plan) {
    case "MONTHLY":
      return "/monthly";
    case "ANNUAL":
      return "/year";
    case "QUARTERLY":
      return "/quarter";
    case "FOUR_YEARS":
      return "/4 years";
    default:
      return "";
  }
}

/* ---------- shared pagination for tabs ---------- */

function TabPagination({
  meta,
  page,
  setPage,
}: {
  meta?: PageMeta;
  page: number;
  setPage: (p: number) => void;
}) {
  if (!meta) return null;
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  return (
    <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className={clsx(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
          page === 1
            ? "cursor-not-allowed border-slate-200 text-slate-300"
            : "border-slate-200 text-slate-700 hover:bg-slate-50"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <div className="flex items-center gap-2 text-sm">
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
          {page}
        </span>
        <span className="text-slate-500">of {totalPages}</span>
      </div>
      <button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className={clsx(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
          page >= totalPages
            ? "cursor-not-allowed border-slate-200 text-slate-300"
            : "border-slate-200 text-slate-700 hover:bg-slate-50"
        )}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ==================== MAIN PAGE ==================== */

const AdminScholarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = React.useState<TabKey>("scholarships");
  const [scholarshipsPage, setScholarshipsPage] = React.useState(1);

  const { data: scholar, isLoading: loadingScholar } = useGetScholarByIdQuery(
    id!,
    { skip: !id }
  );

  console.log(scholar, "SCHOLAR");

  const [updateStatus, { isLoading: updatingStatus }] =
    useUpdateScholarStatusMutation();

  const { data: scholarshipsRes, isLoading: loadingScholarships } =
    useGetScholarScholarshipsQuery(
      { id: id!, page: scholarshipsPage },
      { skip: !id || activeTab !== "scholarships" }
    );

  const scholarships = scholarshipsRes?.data ?? [];
  const scholarshipsMeta = scholarshipsRes?.meta;

  const fullName = scholar
    ? `${scholar.data.firstName ?? ""} ${scholar.data.lastName ?? ""}`.trim()
    : "";

  const statusLabel =
    scholar?.data.status === "Inactive" ? "Deactivated" : scholar?.data.status;

  async function handleToggleStatus() {
    if (!scholar || !id) return;
    const nextStatus: AdminScholar["status"] =
      scholar.data.status === "Active" ? "Inactive" : "Active";
    await updateStatus({
      id,
      status: nextStatus,
      // You can extend UI later to collect a reason from a modal
      deactivationReason: undefined,
    }).unwrap();
  }

  return (
    <div className="space-y-6">
      {/* Heading row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Scholars Details
          </h1>
          {scholar && (
            <p className="mt-1 text-sm text-slate-500">
              {fullName} &middot; {statusLabel}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={!scholar || updatingStatus}
          className={clsx(
            "inline-flex items-center rounded-lg px-5 py-2 text-sm font-semibold shadow-sm",
            scholar?.data.status === "Active"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-800 text-white hover:bg-slate-900"
          )}
        >
          {scholar?.data.status === "Active"
            ? "Deactivate Scholar"
            : "Activate Scholar"}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 pt-4">
          <div className="flex gap-6">
            {(
              [
                ["details", "Scholars Details"],
                ["scholarships", "Scholarships"],
                ["transactions", "Transactions"],
              ] as [TabKey, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={clsx(
                  "border-b-2 pb-3 text-sm font-semibold outline-none",
                  activeTab === key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary row at top of card */}
        <div className="grid gap-8 border-b border-slate-100 px-6 pb-6 pt-6 md:grid-cols-2">
          {loadingScholar && (
            <p className="col-span-2 text-sm text-slate-400">
              Loading scholar details…
            </p>
          )}
          {!loadingScholar && scholar && (
            <>
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {fullName}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {scholar.data.email}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {scholar.data.phone || "-"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Tab content */}
        {activeTab === "details" && (
          <ScholarDetailsTab scholar={scholar?.data} loading={loadingScholar} />
        )}

        {activeTab === "scholarships" && (
          <ScholarScholarshipsTab
            items={scholarships}
            meta={scholarshipsMeta}
            page={scholarshipsPage}
            setPage={setScholarshipsPage}
            loading={loadingScholarships}
          />
        )}

        {activeTab === "transactions" && <ScholarTransactionsPlaceholder />}
      </div>
    </div>
  );
};

/* ---------- Details tab ---------- */

const ScholarDetailsTab: React.FC<{
  scholar?: AdminScholar;
  loading: boolean;
}> = ({ scholar, loading }) => {
  if (loading) {
    return (
      <div className="px-6 py-8 text-sm text-slate-400">
        Loading scholar details…
      </div>
    );
  }

  if (!scholar) {
    return (
      <div className="px-6 py-8 text-sm text-slate-400">Scholar not found.</div>
    );
  }

  return (
    <div className="grid gap-8 px-6 py-8 md:grid-cols-2">
      <div className="space-y-2 text-sm">
        <p className="text-xs font-semibold uppercase text-slate-400">
          Full name
        </p>
        <p className="text-slate-800">
          {scholar.firstName} {scholar.lastName}
        </p>

        <p className="mt-4 text-xs font-semibold uppercase text-slate-400">
          Email address
        </p>
        <p className="text-slate-800">{scholar.email}</p>

        <p className="mt-4 text-xs font-semibold uppercase text-slate-400">
          Phone number
        </p>
        <p className="text-slate-800">{scholar.phone || "-"}</p>
      </div>

      <div className="space-y-2 text-sm">
        <p className="text-xs font-semibold uppercase text-slate-400">
          Date joined
        </p>
        <p className="text-slate-800">{formatDate(scholar.createdAt)}</p>

        <p className="mt-4 text-xs font-semibold uppercase text-slate-400">
          Status
        </p>
        <p className="text-slate-800">
          {scholar.status === "Inactive" ? "Deactivated" : scholar.status}
        </p>
      </div>
    </div>
  );
};

/* ---------- Scholarships tab ---------- */

function statusPill(status: AdminScholarScholarship["applicationStatus"]) {
  let label = status;
  let cls =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600";

  if (status === "Awarded") {
    label = "Awarded";
    cls =
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-600";
  } else if (status === "Rejected") {
    label = "Rejected";
    cls =
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-red-50 text-red-600";
  } else if (status === "Submitted" || status === "UnderReview") {
    label = "Submitted";
    cls =
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600";
  } else {
    //label = status.replace(/([A-Z])/g, " $1").trim();
    return null;
  }

  return <span className={cls}>{label}</span>;
}

const ScholarScholarshipsTab: React.FC<{
  items: AdminScholarScholarship[];
  meta?: PageMeta;
  page: number;
  setPage: (p: number) => void;
  loading: boolean;
}> = ({ items, meta, page, setPage, loading }) => {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr className="text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3 text-left">Scholarship Title</th>
              <th className="px-6 py-3 text-left">Duration</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Date Applied</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm">
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  Loading scholarships…
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  No scholarships found.
                </td>
              </tr>
            )}

            {!loading &&
              items.map((row) => (
                <tr key={row._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-800">
                    {row.scholarshipTitle}
                    {row.fieldOfStudy && (
                      <div className="text-xs text-slate-500">
                        {row.fieldOfStudy}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800">
                    {row.durationLabel ||
                      (row.plan === "FOUR_YEARS"
                        ? "4 years duration"
                        : row.plan === "ANNUAL"
                        ? "1 year duration"
                        : row.plan === "QUARTERLY"
                        ? "Quarterly"
                        : row.plan === "MONTHLY"
                        ? "Monthly"
                        : "-")}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800">
                    {currency(row.amount, row.currency || "NGN")}{" "}
                    {planSuffix(row.plan)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800">
                    {formatDate(row.dateApplied)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {statusPill(row.applicationStatus)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <TabPagination meta={meta} page={page} setPage={setPage} />
    </div>
  );
};

/* ---------- Transactions tab (placeholder only) ---------- */

const ScholarTransactionsPlaceholder: React.FC = () => (
  <div className="px-6 py-10 text-sm text-slate-500">
    <div className="mb-3 flex items-center gap-2">
      <h2 className="text-sm font-semibold text-slate-900">Transactions</h2>
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
        0
      </span>
    </div>
    <p>
      Transactions for this scholar will appear here once the admin transactions
      endpoint is wired to the model.
    </p>
  </div>
);

export default AdminScholarDetailsPage;
