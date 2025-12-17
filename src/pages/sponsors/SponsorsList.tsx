// src/pages/Sponsors/SponsorsList.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetSponsorsQuery } from "@/state/adminApi";


const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const statusOptions = ["All", "Active", "Inactive", "Suspended"] as const;
type StatusFilter = (typeof statusOptions)[number];

const SponsorsList: React.FC = () => {
  const [status, setStatus] = React.useState<StatusFilter>("Active");
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetSponsorsQuery({
    status: status === "All" ? undefined : status,
    search: search || undefined,
    page: 1,
    limit: 20,
  });

  const sponsors = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">All Sponsor</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for Scholars…"
              className="h-10 w-72 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="font-medium text-slate-700">All Sponsor</div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Full name</th>
              <th className="px-6 py-3">Phone Number</th>
              <th className="px-6 py-3">Email address</th>
              <th className="px-6 py-3">Date Joined</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm">
                  Loading sponsors…
                </td>
              </tr>
            )}

            {isError && !isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm">
                  Failed to load sponsors.{" "}
                  <button
                    onClick={() => refetch()}
                    className="text-indigo-600 underline"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && sponsors.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm">
                  No sponsors found.
                </td>
              </tr>
            )}

            {sponsors.map((s: any, idx: number) => (
              <tr
                key={s.id || idx}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
              >
                <td className="px-6 py-3 align-middle text-slate-600 text-xs">
                  {s.id}
                </td>
                <td className="px-6 py-3 align-middle text-sm text-slate-900">
                  {s.fullName}
                </td>
                <td className="px-6 py-3 align-middle text-sm text-slate-600">
                  {s.phone}
                </td>
                <td className="px-6 py-3 align-middle text-sm text-slate-600">
                  {s.email}
                </td>
                <td className="px-6 py-3 align-middle text-sm text-slate-600">
                  {s.dateJoined
                    ? new Date(s.dateJoined).toLocaleDateString("en-GB")
                    : "-"}
                </td>
                <td className="px-6 py-3 align-middle">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                      s.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : s.status === "Suspended"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-3 align-middle text-right text-xs">
                  <button
                    onClick={() => navigate(`/sponsors/${s.id}`)}
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SponsorsList;
