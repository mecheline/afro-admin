// features/scholars/AdminScholarsListPage.tsx
"use client";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Rows3,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import {
  useGetScholarsQuery,
  type AdminScholar,
  type PageMeta,
} from "@/state/adminApi";

const PAGE_SIZE = 10;

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function statusBadge(status: AdminScholar["status"]) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
  if (status === "Active") {
    return (
      <span className={clsx(base, "bg-emerald-50 text-emerald-600")}>
        Active
      </span>
    );
  }
  if (status === "Inactive") {
    return (
      <span className={clsx(base, "bg-slate-100 text-slate-600")}>
        Deactivated
      </span>
    );
  }
  return (
    <span className={clsx(base, "bg-orange-50 text-orange-600")}>
      Suspended
    </span>
  );
}

function buildCode(s: AdminScholar) {
  // You can change this to use a real code if you add it later
  return `AFR/${s._id.slice(-5).toUpperCase()}`;
}

function Pagination({
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

  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let p = 1; p <= totalPages; p++) pages.push(p);
  } else {
    pages.push(1, 2, 3, "…", totalPages - 1, totalPages);
  }

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
        {pages.map((p, idx) =>
          typeof p === "string" ? (
            <span key={idx} className="px-2 text-slate-400">
              {p}
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={clsx(
                "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full px-2 text-sm",
                p === page
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {p}
            </button>
          )
        )}
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

const AdminScholarsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useGetScholarsQuery({
    page,
    limit: PAGE_SIZE,
    q: debouncedSearch || undefined,
  });

  const scholars = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-900">
            Scholars Details
          </h1>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {meta?.total ?? 0}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-[260px] lg:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => {
                setPage(1);
                setSearchInput(e.target.value);
              }}
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
              placeholder="Search scholar by name, or any related keywords"
            />
          </div>

          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>

          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={clsx(
                "inline-flex h-8 w-8 items-center justify-center rounded-full",
                viewMode === "list"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <Rows3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={clsx(
                "inline-flex h-8 w-8 items-center justify-center rounded-full",
                viewMode === "grid"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr className="text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="w-10 px-6 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
              </th>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Full name</th>
              <th className="px-4 py-3 text-left">Email Address</th>
              <th className="px-4 py-3 text-left">Phone Number</th>
              <th className="px-4 py-3 text-left">Date Joined</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm">
            {isLoading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-slate-400"
                >
                  Loading scholars…
                </td>
              </tr>
            )}

            {!isLoading && scholars.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-slate-400"
                >
                  No scholars found.
                </td>
              </tr>
            )}

            {!isLoading &&
              scholars.map((s) => {
                const fullName = `${s.firstName ?? ""} ${
                  s.lastName ?? ""
                }`.trim();
                return (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      />
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-700">
                      {buildCode(s)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {fullName || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                        {s.email}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {s.phone || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-4 py-4">{statusBadge(s.status)}</td>
                    <td className="px-4 py-4 text-sm">
                      <button
                        type="button"
                        onClick={() => navigate(`/scholars/${s._id}`)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <Pagination meta={meta} page={page} setPage={setPage} />
      </div>

      {isFetching && !isLoading && (
        <div className="text-xs text-slate-400">Refreshing…</div>
      )}
    </div>
  );
};

export default AdminScholarsListPage;
