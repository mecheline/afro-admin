import React from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import {
  useGetScholarVerificationDetailQuery,
  useAcceptScholarDocumentsMutation,
  useRejectScholarDocumentsMutation,
  //useVerifyScholarMutation,
  type ScholarVerificationDetail,
  useFundScholarMutation,
} from "../../state/adminApi";
import { FundAmountModal } from "./FundAmountModal";

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
    <div className="space-y-1 text-xs md:text-sm text-gray-700">{children}</div>
  </section>
);

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between gap-3 py-0.5">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="max-w-xs text-xs md:text-sm font-medium text-gray-900 text-right">
      {value ?? "—"}
    </span>
  </div>
);

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

const ScholarVerificationDetailPage: React.FC = () => {
  const { verificationId } = useParams<{ verificationId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useGetScholarVerificationDetailQuery(
    verificationId as string,
    { skip: !verificationId }
  );

  console.log(data, "DATA");

  const [acceptDocs, { isLoading: isAccepting }] =
    useAcceptScholarDocumentsMutation();
  const [rejectDocs, { isLoading: isRejecting }] =
    useRejectScholarDocumentsMutation();
  /*   const [verifyScholar] =
    useVerifyScholarMutation(); */

  const [fundScholar, { isLoading: fundLoading }] = useFundScholarMutation();

  const [reasonOpen, setReasonOpen] = React.useState(false);
  const [fundOpen, setFundOpen] = React.useState(false);

  if (isLoading || !data) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-gray-600 shadow-sm">
        Loading verification…
      </div>
    );
  }

  const detail: ScholarVerificationDetail = data;
  const {
    basicInfo,
    scholarship,
    source,
    status,
    rejectionReason,
    selectionMethod,
  } = detail;

  const isAwarded = status === "Awarded";
  const isRejected = status === "Rejected";

  const isProfileSource = source === "Profile"; // Matched Scholar flow
  const isApplicationSource = source === "Application"; // SelfSelection flow

  // PROFILE-BASED DATA (Matched Scholar)
  const profile = isProfileSource ? (detail as any).profile ?? {} : {};
  const eduTerProfile = profile.education?.tertiary ?? {};
  const ssce = profile.ssce;
  const results = profile.result;

  const hasSsceExams =
    !!ssce && Array.isArray(ssce.exams) && ssce.exams.length > 0;

  const hasResultFiles =
    !!results &&
    !!(
      results.ssce ||
      results.primary ||
      (Array.isArray(results.others) && results.others.length > 0)
    );

  // APPLICATION-BASED DATA (SelfSelection)
  const application = isApplicationSource
    ? (detail as any).application ?? {}
    : {};
  const applicant = application.applicant ?? {};
  const appSnapshot = application.snapshot ?? {};
  const appCurrentStatus = application.currentStatus ?? {};
  const appLetters = application.letters ?? {};
  const appDocuments = application.documents ?? {};
  const appStatus = application.applicationStatus as
    | "Submitted"
    | "UnderReview"
    | "Rejected"
    | "Awarded"
    | undefined;

  const personalDocsMap =
    (appDocuments.personal as Record<string, string> | undefined) ?? {};
  const educationalDocsMap =
    (appDocuments.educational as Record<string, string> | undefined) ?? {};

  const personalDocsEntries = Object.entries(personalDocsMap);
  const educationalDocsEntries = Object.entries(educationalDocsMap);

  const statusLabel =
    status === "Awarded"
      ? "Awarded"
      : status === "UnderReview"
      ? "Pending"
      : "Rejected";

  const sopText = isProfileSource
    ? profile.future?.personalStatement ||
      profile.future?.statementOfPurpose ||
      ""
    : appLetters.motivation || "";

  const handleAccept = async () => {
    try {
      await acceptDocs(detail.verificationId).unwrap();
      toast.success("Documents accepted");
      navigate("/admin/document-verifications");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to accept documents");
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectDocs({
        verificationId: detail.verificationId,
        reason,
      }).unwrap();
      toast.success("Documents rejected");
      setReasonOpen(false);
      navigate("/admin/document-verifications");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reject documents");
    }
  };

  /* const handleVerify = async () => {
    try {
      await verifyScholar(detail.scholarId).unwrap();
      toast.success("Scholar verified successfully");
      navigate("/admin/document-verifications");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to verify scholar");
    }
  }; */

  // OLD:
  // const handleClick = async () => { ... }

  // NEW:
  const handleFundConfirm = async (amount: number) => {
    try {
      const res = await fundScholar({
        scholarId: detail.scholarId,
        sponsorId: detail.sponsorId, // comes from your API now
        scholarshipId: detail.scholarship.id, // same as before
        amount, // overrideAmount on backend
      }).unwrap();

      toast.success("Scholar funded successfully");
      console.log("Payment:", res.payment);
      setFundOpen(false);
    } catch (err: any) {
      toast.error(
        err?.data?.msg || "Failed to fund scholar. Please try again."
      );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-2 inline-flex items-center rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {basicInfo.fullName}
          </h1>
          <p className="text-xs text-gray-500">
            {basicInfo.phone} · {basicInfo.email}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {scholarship.title} · {scholarship.category}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Source:{" "}
            <span className="font-medium">
              {isProfileSource
                ? "Matched scholar profile"
                : "Scholarship application"}
            </span>{" "}
            · Selection:{" "}
            <span className="font-medium">{selectionMethod || "—"}</span> ·
            Status: <span className="font-medium">{statusLabel}</span>
            {/*   {isApplicationSource && appStatus && (
              <>
                {" "}
                · Application status:{" "}
                <span className="font-medium">{appStatus}</span>
              </>
            )} */}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFundOpen(true)}
          disabled={!isAwarded || fundLoading}
          className="rounded-md px-3 py-1.5 text-xs font-semibold text-white 
             disabled:cursor-not-allowed disabled:bg-blue-300
             bg-blue-600 hover:bg-blue-700"
        >
          {fundLoading ? "Funding…" : "Fund Scholar"}
        </button>
      </div>

      {/* BODY LAYOUT */}
      {isApplicationSource ? (
        /* ✅ SELF-SELECTION / APPLICATION VIEW:
           show ONLY application snapshot details + docs/letters */
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Column 1: Applicant + basic snapshot */}
          <div className="space-y-4">
            <Card title="Applicant Details">
              <Row label="Full Name" value={applicant.fullName} />
              <Row label="Email" value={applicant.email} />
              <Row label="Phone" value={applicant.phone} />
              <Row label="Date of Birth" value={applicant.dob} />
              <Row label="Gender" value={applicant.gender} />
            </Card>

            <Card title="Application Snapshot">
              <Row
                label="Minimum Qualification"
                value={appSnapshot.minimumQualifications}
              />
              <Row label="Field of Study" value={appSnapshot.fieldOfStudy} />
              <Row label="Application Status" value={appStatus} />
            </Card>
          </div>

          {/* Column 2: SOP + Current Status */}
          <div className="space-y-4">
            <Card title="SOP / Motivation">
              <div className="max-h-52 overflow-y-auto rounded-md border border-gray-200 p-3 text-xs leading-relaxed text-gray-800">
                {sopText || "No SOP / Motivation provided."}
              </div>

              {status === "Rejected" && rejectionReason && (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-semibold text-red-600">
                    Reason for rejection:
                  </p>
                  <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    {rejectionReason}
                  </div>
                </div>
              )}
            </Card>

            <Card title="Current Status">
              <Row
                label="Employment Status"
                value={appCurrentStatus.employmentStatus}
              />
              <Row
                label="Current Degree"
                value={appCurrentStatus.currentDegree}
              />
              <Row label="CGPA" value={appCurrentStatus.cgpa} />
            </Card>
          </div>

          {/* Column 3: Documents + CV */}
          <div className="space-y-4">
            <Card title="Personal Documents">
              {personalDocsEntries.length === 0 ? (
                <p className="text-xs text-gray-500">No personal documents.</p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {personalDocsEntries.map(([label, url]) => (
                    <li
                      key={`personal-${label}-${url}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate text-gray-700">{label}</span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-indigo-600"
                      >
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Educational Documents">
              {educationalDocsEntries.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No educational documents.
                </p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {educationalDocsEntries.map(([label, url]) => (
                    <li
                      key={`educational-${label}-${url}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate text-gray-700">{label}</span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-indigo-600"
                      >
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="CV">
              {appLetters.cvUrl ? (
                <a
                  href={appLetters.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  View CV
                </a>
              ) : (
                <p className="text-xs text-gray-500">No CV uploaded.</p>
              )}
            </Card>
          </div>
        </div>
      ) : (
        /* ✅ MATCHED SCHOLAR / PROFILE VIEW:
           your original 3-column layout using profile.ssce/result/tertiary */
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Column 1: personal + address */}
          <div className="space-y-4">
            <Card title="Personal Details">
              <Row label="Full Name" value={basicInfo.fullName} />
              <Row label="Email" value={basicInfo.email} />
              <Row label="Phone" value={basicInfo.phone || "—"} />
              <Row
                label="DOB"
                value={
                  profile.personal?.dateOfBirth
                    ? new Date(
                        profile.personal.dateOfBirth
                      ).toLocaleDateString()
                    : "—"
                }
              />
              <Row label="Gender" value={profile.demographics?.gender || "—"} />
            </Card>

            <Card title="Contact & Address">
              <Row
                label="Preferred Phone"
                value={profile.contact?.preferredPhone}
              />
              <Row
                label="Alternate Phone"
                value={profile.contact?.alternatePhone}
              />
              <Row label="Home Address" value={profile.address?.homeAddress} />
              <Row label="Alt Address" value={profile.address?.altAddress} />
            </Card>
          </div>

          {/* Column 2: SOP + Education */}
          <div className="space-y-4">
            <Card title="SOP / Motivation">
              <div className="max-h-52 overflow-y-auto rounded-md border border-gray-200 p-3 text-xs leading-relaxed text-gray-800">
                {sopText || "No SOP / Motivation provided."}
              </div>

              {status === "Rejected" && rejectionReason && (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-semibold text-red-600">
                    Reason for rejection:
                  </p>
                  <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    {rejectionReason}
                  </div>
                </div>
              )}
            </Card>

            <Card title="Academic Information">
              <Row
                label="Field of Study"
                value={
                  eduTerProfile.fieldOfStudyLabel ||
                  eduTerProfile.fieldOfStudy ||
                  "—"
                }
              />
              <Row
                label="Minimum Qualification"
                value={eduTerProfile.minQualification}
              />
              <Row
                label="Boarding (Tertiary)"
                value={eduTerProfile.boarding || "—"}
              />
              <Row
                label="School Type"
                value={eduTerProfile.schoolType || "—"}
              />
              <Row label="CGPA" value={eduTerProfile.cgpa || "—"} />
            </Card>
          </div>

          {/* Column 3: SSCE + uploaded results */}
          <div className="space-y-4">
            <Card title="SSCE Exams">
              {!hasSsceExams && (
                <p className="text-xs text-gray-500">
                  No SSCE exams information provided.
                </p>
              )}

              {hasSsceExams && (
                <div className="space-y-3">
                  {ssce.exams.map((exam: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-600">
                        <span>
                          <span className="font-semibold text-gray-700">
                            Board:
                          </span>{" "}
                          {exam.board || "—"}
                        </span>
                        <span>
                          <span className="font-semibold text-gray-700">
                            Exam No:
                          </span>{" "}
                          {exam.examNumber || "—"}
                        </span>
                        <span>
                          <span className="font-semibold text-gray-700">
                            Date:
                          </span>{" "}
                          {exam.date || "—"}
                        </span>
                      </div>

                      {Array.isArray(exam.subjects) &&
                        exam.subjects.length > 0 && (
                          <div className="mt-2 rounded-md bg-white p-2 text-xs">
                            <div className="mb-1 flex justify-between text-[11px] font-semibold text-gray-500">
                              <span>Subject</span>
                              <span>Grade</span>
                            </div>
                            <ul className="space-y-1">
                              {exam.subjects.map((subj: any, sIdx: number) => (
                                <li
                                  key={sIdx}
                                  className="flex items-center justify-between"
                                >
                                  <span className="text-gray-700">
                                    {subj.subject || "—"}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {subj.grade || "—"}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Uploaded Result Files">
              {!hasResultFiles && (
                <p className="text-xs text-gray-500">
                  No uploaded result files.
                </p>
              )}

              {hasResultFiles && (
                <div className="space-y-3 text-xs">
                  {results?.ssce && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-600">SSCE Result</span>
                      <a
                        href={results.ssce}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-indigo-600"
                      >
                        View
                      </a>
                    </div>
                  )}

                  {results?.primary && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-600">Primary Certificate</span>
                      <a
                        href={results.primary}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-indigo-600"
                      >
                        View
                      </a>
                    </div>
                  )}

                  {Array.isArray(results?.others) &&
                    results.others.length > 0 && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase text-gray-500">
                          Other Results
                        </p>
                        <ul className="space-y-1">
                          {results.others.map((r: any, idx: number) =>
                            r?.url ? (
                              <li
                                key={r.label || `other-${idx}`}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="truncate text-gray-700">
                                  {r.label || "Result"}
                                </span>
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-semibold text-indigo-600"
                                >
                                  View
                                </a>
                              </li>
                            ) : null
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Global actions bar – affects ALL documents */}
      <div className="sticky bottom-0 mt-6 border-t border-gray-100 bg-white py-4">
        <div className="flex justify-end gap-3">
          {/* Always show Reject except when already rejected */}
          {!isRejected && (
            <button
              className="h-9 rounded-full bg-red-50 px-4 text-xs font-semibold text-red-600 disabled:opacity-60"
              onClick={() => setReasonOpen(true)}
              disabled={isRejecting}
            >
              {isRejecting ? "Rejecting…" : "Reject"}
            </button>
          )}

          {/* Show Accept only when NOT awarded and NOT rejected */}
          {!isAwarded && !isRejected && (
            <button
              className="h-9 rounded-full bg-indigo-600 px-4 text-xs font-semibold text-white disabled:opacity-60"
              onClick={handleAccept}
              disabled={isAccepting}
            >
              {isAccepting ? "Accepting…" : "Accept Document"}
            </button>
          )}
        </div>
      </div>

      <ReasonModal
        open={reasonOpen}
        onClose={() => setReasonOpen(false)}
        onSave={handleReject}
      />

      <FundAmountModal
        open={fundOpen}
        onClose={() => setFundOpen(false)}
        onConfirm={handleFundConfirm}
        isSubmitting={fundLoading}
      />
    </div>
  );
};

export default ScholarVerificationDetailPage;
