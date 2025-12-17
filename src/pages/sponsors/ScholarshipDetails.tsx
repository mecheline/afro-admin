// src/pages/Sponsors/ScholarshipDetails.tsx
import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSponsorScholarshipByIdQuery } from "@/state/adminApi";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const ScholarshipDetails: React.FC = () => {
  const { sponsorId, scholarshipId } = useParams<{
    sponsorId: string;
    scholarshipId: string;
  }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } =
    useGetSponsorScholarshipByIdQuery(
      { sponsorId: sponsorId!, scholarshipId: scholarshipId! },
      { skip: !sponsorId || !scholarshipId }
    );

  const scholarship = data?.data;

  return (
    <div className="space-y-6">
      {/* Header / breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(`/sponsors/${sponsorId}`)}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ← Back to sponsor
          </button>
          <h1 className="mt-2 text-lg font-semibold text-slate-900">
            {scholarship?.title ?? "Scholarship details"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {scholarship?.category} •{" "}
            {scholarship?.selectionMethod === "SelfSelection"
              ? "Self Selection"
              : "Matched Scholars"}
          </p>
        </div>

        {scholarship && (
          <div className="text-right">
            <div className="text-xs text-slate-400">Sponsor</div>
            <div className="text-sm font-medium text-slate-900">
              {scholarship.sponsorName}
            </div>
          </div>
        )}
      </div>

      {/* Loading / error states */}
      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading scholarship details…
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
          Failed to load scholarship.{" "}
          <button onClick={() => refetch()} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {scholarship && !isLoading && !isError && (
        <>
          {/* Top stats cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Scholarship Amount">
              ₦{(scholarship.funding?.amount || 0).toLocaleString()}
              {scholarship.funding?.plan
                ? ` / ${scholarship.funding.plan.toLowerCase()}`
                : ""}
            </StatCard>
            <StatCard label="Funding Status">
              <span
                className={cn(
                  "inline-flex rounded-full px-2 py-1 text-[11px] font-medium",
                  scholarship.funding?.isPaid
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                )}
              >
                {scholarship.funding?.isPaid ? "Paid" : "Pending"}
              </span>
            </StatCard>
            <StatCard label="Recipients">
              {scholarship.recipients ?? "-"}
            </StatCard>
            <StatCard label="Total Applicants">
              {scholarship.applicantsCount ?? 0}
            </StatCard>
          </div>

          {/* Layout: left = details, right = documents */}
          <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr]">
            {/* Left: description + eligibility */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Scholarship description
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {scholarship.description || "No description provided."}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Eligibility
                </h2>

                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Field of Study</span>
                    <span className="font-medium">
                      {scholarship.fieldOfStudy || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Category</span>
                    <span className="font-medium">
                      {scholarship.category || "-"}
                    </span>
                  </div>
                </div>

                {scholarship?.minimumQualifications && (
                  <div className="mt-4">
                    <div className="mb-2 text-xs font-semibold text-slate-500">
                      Minimum qualifications
                    </div>
                    {scholarship?.minimumQualifications}
                  </div>
                )}
              </div>
            </div>

            {/* Right: documents */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Required documents
                </h2>

                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <div className="text-xs uppercase text-slate-400">
                      Personal
                    </div>
                    {scholarship.documents?.personal?.length ? (
                      <ul className="mt-1 space-y-1 text-slate-600">
                        {scholarship.documents.personal.map(
                          (d: string, idx: number) => (
                            <li key={idx}>• {d}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        No personal documents required.
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="mt-3 text-xs uppercase text-slate-400">
                      Educational
                    </div>
                    {scholarship.documents?.educational?.length ? (
                      <ul className="mt-1 space-y-1 text-slate-600">
                        {scholarship.documents.educational.map(
                          (d: string, idx: number) => (
                            <li key={idx}>• {d}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        No educational documents required.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Documents deadline</span>
                    <span className="font-medium text-slate-800">
                      {scholarship.documents?.deadline
                        ? new Date(
                            scholarship.documents.deadline
                          ).toLocaleDateString("en-GB")
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Status</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      scholarship.active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {scholarship.active ? "Active" : "Completed"}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Created</span>
                  <span>
                    {scholarship.createdAt
                      ? new Date(scholarship.createdAt).toLocaleDateString(
                          "en-GB"
                        )
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="mt-1 text-sm font-semibold text-slate-900">{children}</div>
  </div>
);

export default ScholarshipDetails;
