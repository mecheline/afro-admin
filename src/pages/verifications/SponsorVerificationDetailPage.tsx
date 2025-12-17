// src/features/admin/document-verifications/SponsorVerificationDetailPage.tsx
import React from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import {
  useGetSponsorVerificationDetailQuery,
  useVerifySponsorMutation,
  useRejectSponsorVerificationMutation,
} from "../../state/adminApi";

const ReasonModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (reason: string) => void;
}> = ({ open, onClose, onSave }) => {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!open) setValue("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
        <h2 className="mb-2 text-sm font-semibold text-gray-800">
          Reason for rejection
        </h2>
        <textarea
          className="mb-4 h-28 w-full rounded-md border border-gray-200 p-2 text-sm outline-none focus:border-indigo-500"
          placeholder="Enter reason"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex justify-end gap-2 text-sm">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(value)}
            className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const SponsorVerificationDetailPage: React.FC = () => {
  const { sponsorId } = useParams<{ sponsorId: string }>();
  const navigate = useNavigate();

  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useGetSponsorVerificationDetailQuery(sponsorId as string, {
    skip: !sponsorId,
  });

  const [verifySponsor, { isLoading: isVerifying }] =
    useVerifySponsorMutation();
  const [rejectSponsor, { isLoading: isRejecting }] =
    useRejectSponsorVerificationMutation();

  const [reasonOpen, setReasonOpen] = React.useState(false);

  // 🔹 Normalize shape: support BOTH `{ basicInfo, document, sponsorId }`
  // and `{ message, data: { ... } }`
  const detail = React.useMemo(() => {
    if (!rawData) return undefined as any;
    if ("basicInfo" in (rawData as any) || "document" in (rawData as any)) {
      return rawData as any; // already the inner object
    }
    if ("data" in (rawData as any)) {
      return (rawData as any).data;
    }
    return undefined as any;
  }, [rawData]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-gray-600 shadow-sm">
        Loading…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-red-600 shadow-sm">
        Failed to load sponsor verification detail
        {(error as any)?.data?.message
          ? `: ${(error as any).data.message}`
          : ""}
      </div>
    );
  }

  // If nothing valid came back
  if (!detail) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-gray-600 shadow-sm">
        No verification detail found.
      </div>
    );
  }

  const basicInfo = detail.basicInfo || {};
  const document = detail.document || {};
  const effectiveSponsorId = detail.sponsorId ?? sponsorId;

  const handleVerify = async () => {
    if (!effectiveSponsorId) {
      toast.error("Missing sponsor id");
      return;
    }

    try {
      await verifySponsor(effectiveSponsorId).unwrap();
      toast.success("Sponsor verified");
      navigate(-1);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to verify sponsor");
    }
  };

  const handleReject = async (reason: string) => {
    if (!effectiveSponsorId) {
      toast.error("Missing sponsor id");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await rejectSponsor({ sponsorId: effectiveSponsorId, reason }).unwrap();
      toast.success("Sponsor documents rejected");
      setReasonOpen(false);
      navigate(-1);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reject documents");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-2 inline-flex items-center rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {basicInfo.fullName || "Sponsor"}
          </h1>
          <p className="text-xs text-gray-500">
            {basicInfo.phone || "—"} · {basicInfo.email || "—"}
          </p>
        </div>

        {/* <button
          className="h-9 rounded-full bg-indigo-600 px-4 text-xs font-semibold text-white disabled:opacity-60"
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying…" : "Verify Sponsor"}
        </button> */}
      </div>

      {/* Main card */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Personal Details
          </h3>
          <div className="space-y-1 text-xs md:text-sm text-gray-700">
            <div className="flex justify-between gap-3 py-0.5">
              <span className="text-xs text-gray-500">Full Name</span>
              <span className="font-medium text-gray-900">
                {basicInfo.fullName || "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3 py-0.5">
              <span className="text-xs text-gray-500">Email</span>
              <span className="font-medium text-gray-900">
                {basicInfo.email || "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3 py-0.5">
              <span className="text-xs text-gray-500">Phone</span>
              <span className="font-medium text-gray-900">
                {basicInfo.phone || "—"}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Verification Document
          </h3>
          <div className="space-y-2 text-xs md:text-sm text-gray-700">
            <div className="flex justify-between gap-3 py-0.5">
              <span className="text-xs text-gray-500">ID Type</span>
              <span className="font-medium text-gray-900">
                {document.idType || "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3 py-0.5">
              <span className="text-xs text-gray-500">Uploaded</span>
              <span className="font-medium text-gray-900">
                {document.uploadedAt
                  ? new Date(document.uploadedAt).toLocaleString()
                  : "—"}
              </span>
            </div>

            {document.uploadURL ? (
              <div className="pt-2">
                <a
                  href={document.uploadURL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  View Document
                </a>
              </div>
            ) : (
              <p className="pt-2 text-xs text-gray-500">
                No verification document uploaded.
              </p>
            )}

            {document.status === "Rejected" && document.rejectionReason && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                <p className="mb-1 font-semibold">Reason for rejection</p>
                <p>{document.rejectionReason}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Global action bar */}
      <div className="sticky bottom-0 mt-6 border-t border-gray-100 bg-white py-4">
        <div className="flex justify-end gap-3">
          <button
            className="h-9 rounded-full bg-red-50 px-4 text-xs font-semibold text-red-600 disabled:opacity-60"
            onClick={() => setReasonOpen(true)}
            disabled={isRejecting}
          >
            {isRejecting ? "Rejecting…" : "Reject"}
          </button>
          <button
            className="h-9 rounded-full bg-indigo-600 px-4 text-xs font-semibold text-white disabled:opacity-60"
            onClick={handleVerify}
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying…" : "Verify Sponsor"}
          </button>
        </div>
      </div>

      <ReasonModal
        open={reasonOpen}
        onClose={() => setReasonOpen(false)}
        onSave={handleReject}
      />
    </div>
  );
};

export default SponsorVerificationDetailPage;
