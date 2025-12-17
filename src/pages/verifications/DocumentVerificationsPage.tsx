// src/features/admin/document-verifications/DocumentVerificationsPage.tsx
import React from "react";
import { useNavigate } from "react-router";
import { MoreHorizontal } from "lucide-react";

import {
  useGetScholarVerificationsQuery,
  useGetSponsorVerificationsQuery,
  type ScholarVerificationRow,
  type SponsorVerificationRow,
  type DocVerificationStatus,
} from "../../state/adminApi";

type TabKey = "scholars" | "sponsors";

const mapStatusToLabel = (status: DocVerificationStatus) =>
  status === "UnderReview"
    ? "Under Review"
    : status === "Awarded"
    ? "Awarded"
    : "Rejected";

const StatusPill: React.FC<{ status: DocVerificationStatus }> = ({
  status,
}) => {
  const label = mapStatusToLabel(status);
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  if (status === "Awarded") {
    return (
      <span className={`${base} bg-green-50 text-green-700`}>
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500" />
        {label}
      </span>
    );
  }
  if (status === "UnderReview") {
    return (
      <span className={`${base} bg-gray-50 text-gray-600`}>
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-gray-500" />
        {label}
      </span>
    );
  }
  return (
    <span className={`${base} bg-red-50 text-red-600`}>
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500" />
      {label}
    </span>
  );
};

const ActionMenu: React.FC<{
  onViewDocument: () => void;
  onViewProfile: () => void;
}> = ({ onViewDocument, onViewProfile }) => (
  <div className="z-30 w-40 rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg">
    <button
      className="flex w-full items-center px-3 py-2 text-left hover:bg-gray-50"
      onClick={onViewDocument}
    >
      <span className="mr-2">✏️</span>
      View Document
    </button>
    {/*   <button
      className="flex w-full items-center px-3 py-2 text-left hover:bg-gray-50"
      onClick={onViewProfile}
    >
      <span className="mr-2">👁</span>
      View Profile
    </button> */}
  </div>
);

type AnyRow = ScholarVerificationRow | SponsorVerificationRow;

const DocumentVerificationsPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = React.useState<TabKey>("scholars");
  const [pageScholars, setPageScholars] = React.useState(1);
  const [pageSponsors, setPageSponsors] = React.useState(1);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  // SCHOLARS
  const { data: scholarData, isLoading: loadingScholars } =
    useGetScholarVerificationsQuery(
      { page: pageScholars, status: "all" },
      { skip: activeTab !== "scholars" }
    );

  // SPONSORS
  const { data: sponsorData, isLoading: loadingSponsors } =
    useGetSponsorVerificationsQuery(
      { page: pageSponsors },
      { skip: activeTab !== "sponsors" }
    );

  // 🔹 Safely unwrap in case transformResponse was not added yet
  const scholarList = scholarData as
    | {
        items: ScholarVerificationRow[];
        page: number;
        pageSize: number;
        total: number;
      }
    | undefined;

  const sponsorList = (():
    | {
        items: SponsorVerificationRow[];
        page: number;
        pageSize: number;
        total: number;
      }
    | undefined => {
    if (!sponsorData) return undefined;
    // if you already used transformResponse, sponsorData IS the inner data
    if ("items" in sponsorData && Array.isArray((sponsorData as any).items)) {
      return sponsorData as any;
    }
    // fallback if shape is { message, data: {...} }
    if (
      "data" in sponsorData &&
      sponsorData.data &&
      Array.isArray((sponsorData as any).data.items)
    ) {
      return (sponsorData as any).data;
    }
    return undefined;
  })();

  const listData = activeTab === "scholars" ? scholarList : sponsorList;

  console.log(listData, "LIST DATA");

  const items: AnyRow[] = listData?.items ?? [];
  const page =
    activeTab === "scholars"
      ? scholarList?.page ?? pageScholars
      : sponsorList?.page ?? pageSponsors;
  const total = listData?.total ?? 0;
  const pageSize = listData?.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const isLoading =
    (activeTab === "scholars" && loadingScholars) ||
    (activeTab === "sponsors" && loadingSponsors);

  const handleChangePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (activeTab === "scholars") setPageScholars(newPage);
    else setPageSponsors(newPage);
  };

  const handleViewDocument = (row: AnyRow) => {
    setOpenMenuId(null);

    if ("verificationId" in row) {
      navigate(`/verifications/scholars/${row.verificationId}`);
    } else {
      navigate(`/verifications/sponsors/${row.sponsorId}`);
    }
  };

  const handleViewProfile = (row: AnyRow) => {
    setOpenMenuId(null);

    if ("scholarId" in row) {
      navigate(`/admin/scholars/${row.scholarId}`);
    } else {
      navigate(`/admin/sponsors/${row.sponsorId}`);
    }
  };

  const getRowKey = (row: AnyRow) =>
    "verificationId" in row ? row.verificationId : row.sponsorId;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Document Verifications
          </h1>
        </div>

        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          12 new
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 text-sm">
          <button
            className={`border-b-2 px-1 pb-2 ${
              activeTab === "scholars"
                ? "border-indigo-600 font-medium text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("scholars");
              setOpenMenuId(null);
            }}
          >
            Scholars
          </button>
          <button
            className={`border-b-2 px-1 pb-2 ${
              activeTab === "sponsors"
                ? "border-indigo-600 font-medium text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("sponsors");
              setOpenMenuId(null);
            }}
          >
            Sponsors
          </button>
        </nav>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50 text-xs font-medium text-gray-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Purpose</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date sent</th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-xs text-gray-500"
                >
                  Loading…
                </td>
              </tr>
            )}

            {!isLoading && items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-xs text-gray-500"
                >
                  No records found.
                </td>
              </tr>
            )}

            {!isLoading &&
              items.map((row) => {
                const key = getRowKey(row);
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs">
                        {row.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.purpose}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(row.dateSent).toLocaleString()}
                    </td>
                    <td className="relative px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((prev) => (prev === key ? null : key))
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {openMenuId === key && (
                        <div className="absolute right-4 top-9">
                          <ActionMenu
                            onViewDocument={() => handleViewDocument(row)}
                            onViewProfile={() => handleViewProfile(row)}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-600">
          <button
            onClick={() => handleChangePage(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center rounded-md border px-3 py-1.5 disabled:opacity-50"
          >
            ← Previous
          </button>

          <div>
            Page {page} of {totalPages}
          </div>

          <button
            onClick={() => handleChangePage(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center rounded-md border px-3 py-1.5 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationsPage;
