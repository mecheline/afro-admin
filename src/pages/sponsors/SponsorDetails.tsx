// src/pages/Sponsors/SponsorDetails.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetSponsorByIdQuery,
  useGetSponsorScholarshipsQuery,
  useGetSponsorApplicantsQuery,
  useGetSponsorTransactionsQuery,
} from "@/state/adminApi";
import ScholarDetailsModal from "./ScholarDetailsModal";


const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type TabKey = "scholarships" | "applicants" | "transactions";

const SponsorDetails: React.FC = () => {
    const { sponsorId } = useParams<{ sponsorId: string }>();
    const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<TabKey>("scholarships");
  const [selectedScholarId, setSelectedScholarId] = React.useState<
    string | null
  >(null);

  const { data: sponsorResp } = useGetSponsorByIdQuery(sponsorId!, {
    skip: !sponsorId,
  });
  const sponsor = sponsorResp?.data;

  const { data: scholarshipsResp } = useGetSponsorScholarshipsQuery(
    { sponsorId: sponsorId! },
    { skip: !sponsorId }
  );
  const scholarships = scholarshipsResp?.data ?? [];

  const [selectedScholarshipId, setSelectedScholarshipId] = React.useState<
    string | "all"
  >("all");

  const { data: applicantsResp } = useGetSponsorApplicantsQuery(
    {
      sponsorId: sponsorId!,
      scholarshipId:
        selectedScholarshipId === "all" ? undefined : selectedScholarshipId,
    },
    { skip: !sponsorId || activeTab !== "applicants" }
  );
  const applicants = applicantsResp?.data ?? [];

  const { data: txResp } = useGetSponsorTransactionsQuery(
    { sponsorId: sponsorId!, page: 1, limit: 20 },
    { skip: !sponsorId || activeTab !== "transactions" }
  );
  const transactions = txResp?.data ?? [];

  if (!sponsor) {
    return <div>Loading sponsor…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-500">Sponsors &gt; Details</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">
          {sponsor.fullName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{sponsor.email}</p>
        <p className="text-sm text-slate-500">{sponsor.phone}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("scholarships")}
            className={cn(
              "border-b-2 border-transparent pb-3 text-sm font-medium transition-colors",
              activeTab === "scholarships"
                ? "border-indigo-500 text-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Scholarships
          </button>

          <button
            onClick={() => setActiveTab("applicants")}
            className={cn(
              "border-b-2 border-transparent pb-3 text-sm font-medium transition-colors",
              activeTab === "applicants"
                ? "border-indigo-500 text-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Applicants
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={cn(
              "border-b-2 border-transparent pb-3 text-sm font-medium transition-colors",
              activeTab === "transactions"
                ? "border-indigo-500 text-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Transactions
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "scholarships" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
              Scholarships
              <span className="rounded-full bg-slate-100 px-2 text-xs">
                {scholarships.length}
              </span>
            </div>
          </div>
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Scholarship Title</th>
                <th className="px-6 py-3">Scholars</th>
                <th className="px-6 py-3">Scholarship Amount</th>
                <th className="px-6 py-3">Total Disbursed</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {scholarships.map((s: any) => (
                <tr
                  key={s.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                >
                  <td className="px-6 py-3 text-xs text-slate-600">{s.id}</td>
                  <td className="px-6 py-3">
                    <div className="text-sm font-medium text-slate-900">
                      {s.title}
                    </div>
                    <div className="text-xs text-slate-500">{s.category}</div>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    {s.scholarsCount}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    ₦{s.amount?.toLocaleString()} / {s.plan?.toLowerCase()}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    ₦{(s.totalDisbursed || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        s.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-xs">
                    <button
                      onClick={() =>
                        navigate(`/sponsors/${sponsorId}/scholarships/${s.id}`)
                      }
                      className="text-indigo-600 hover:underline"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
              {scholarships.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-sm text-slate-500"
                  >
                    No scholarships yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "applicants" && (
        <div className="space-y-4">
          {/* Top metrics + scholarship filter */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {/* <Metric label="Total Disbursed" value="₦1,000,000" /> */}
                <Metric label="Total Applicants" value={applicants.length} />
                <Metric
                  label="Total Scholarships"
                  value={scholarships.length}
                />
                {/* <Metric label="Outstanding Amount" value="₦800,000" /> */}
              </div>
              <div>
                <select
                  value={selectedScholarshipId}
                  onChange={(e) =>
                    setSelectedScholarshipId(e.target.value as any)
                  }
                  className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Scholarships</option>
                  {scholarships.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Applicants table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                Scholars
                <span className="rounded-full bg-slate-100 px-2 text-xs">
                  {applicants.length}
                </span>
              </div>
            </div>
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Applicant Name</th>
                  <th className="px-6 py-3">Total Disbursed</th>
                  <th className="px-6 py-3">Date Disbursed</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a: any) => (
                  <tr
                    key={a.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-3 text-xs text-slate-600">{a.id}</td>
                    <td className="px-6 py-3 text-sm text-slate-900">
                      {a.applicantName}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">
                      ₦{(a.totalDisbursed || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">
                      {a.dateDisbursed
                        ? new Date(a.dateDisbursed).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td className="px-6 py-3 text-right text-xs">
                      <button
                        onClick={() => setSelectedScholarId(a.scholarId)}
                        className="text-indigo-600 hover:underline"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
                {applicants.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      No applicants yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Scholar modal */}
          {selectedScholarId && (
            <ScholarDetailsModal
              scholarId={selectedScholarId}
              open={!!selectedScholarId}
              onClose={() => setSelectedScholarId(null)}
            />
          )}
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
              Transactions
              <span className="rounded-full bg-slate-100 px-2 text-xs">
                {transactions.length}
              </span>
            </div>
          </div>
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Scholar Name</th>
                <th className="px-6 py-3">Scholarship Title</th>
                <th className="px-6 py-3">Date Disbursed</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: any) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                >
                  <td className="px-6 py-3 text-xs text-slate-600">
                    {t.reference}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-900">
                    {/* Fill with scholar name once wired */}
                    Anthony Jeremiah
                  </td>
                  <td className="px-6 py-3">
                    <div className="text-sm font-medium text-slate-900">
                      {t.scholarshipTitle || "-"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {t.scholarshipCategory}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    {t.dateDisbursed
                      ? new Date(t.dateDisbursed).toLocaleDateString("en-GB")
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-emerald-600">
                    ₦{(t.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    ₦{(t.outstanding || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-slate-500"
                  >
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="border-t border-slate-100 px-6 py-4 text-center text-sm text-indigo-600">
            <button className="hover:underline">Load more</button>
          </div>
        </div>
      )}
    </div>
  );
};

const Metric: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
  </div>
);

export default SponsorDetails;
