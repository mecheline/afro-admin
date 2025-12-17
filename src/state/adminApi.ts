// src/state/adminApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";
import type { User } from "./authSlice";
import type { Role, Permission } from "@/auth/rbac";

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
}

export interface Paged<T> {
  data: T[];
  meta: PageMeta;
}

type AdminUserRow = User & { status: "Active" | "Inactive" };

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role | string;
  permissions: Permission[] | string[];
  status?: string;
  createdAt?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type RegisterSuperAdminPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  user: User;
}

export interface PagedUsersResponse {
  items: User[];
  totalCount: number;
}

export interface RoleDto {
  _id: string;
  title: Role;
  permissions: Permission[];
  assignedUsers: string[]; // user ids
}

export type AdminScholarStatus = "Active" | "Inactive" | "Suspended";

export interface AdminScholar {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  gender?: string;
  employmentStatus?: string;
  currentDegree?: string;
  countryOfResidence?: string;
  status: AdminScholarStatus;
  createdAt: string; // timestamps: true
  updatedAt?: string;

  // optional nested object from controller (deactivationRequest)
  deactivationRequest?: {
    status: "Pending" | "Approved" | "Rejected" | "Cancelled";
    reason?: string;
    requestedAt?: string;
    processedAt?: string;
    adminNote?: string;
  } | null;
}
export interface AdminScholarID {
  data: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    gender?: string;
    employmentStatus?: string;
    currentDegree?: string;
    countryOfResidence?: string;
    status: AdminScholarStatus;
    createdAt: string; // timestamps: true
    updatedAt?: string;

    // optional nested object from controller (deactivationRequest)
    deactivationRequest?: {
      status: "Pending" | "Approved" | "Rejected" | "Cancelled";
      reason?: string;
      requestedAt?: string;
      processedAt?: string;
      adminNote?: string;
    } | null;
  };
}

export interface AdminScholarListQuery {
  page?: number;
  limit?: number;
  q?: string;
  status?: AdminScholarStatus | "All";
}

// Scholarships tab (from getScholarScholarships controller)
export type AdminScholarApplicationStatus =
  | "Submitted"
  | "UnderReview"
  | "Rejected"
  | "Awarded"


export type FundingPlan = "FOUR_YEARS" | "ANNUAL" | "QUARTERLY" | "MONTHLY";

export interface AdminScholarScholarship {
  _id: string; // application._id
  scholarshipId: string; // Sponsor.scholarships._id
  sponsorId: string;

  scholarshipTitle: string;
  category?: string;
  fieldOfStudy?: string;

  amount: number;
  currency?: string; // "NGN"
  plan?: FundingPlan; // funding.plan
  durationLabel?: string; // precomputed label in controller

  applicationStatus: AdminScholarApplicationStatus;
  dateApplied: string; // application.createdAt
}

export type DocVerificationStatus = "UnderReview" | "Awarded" | "Rejected";

export interface ScholarVerificationRow {
  verificationId: string;
  scholarId: string;
  name: string;
  email: string;
  purpose: string; // "Matched scholar profile" | "Scholarship Application"
  selectionMethod: "MatchedScholar" | "SelfSelection";
  scholarshipTitle: string;
  status: DocVerificationStatus;
  dateSent: string;
}

export interface ScholarVerificationList {
  items: ScholarVerificationRow[];
  page: number;
  pageSize: number;
  total: number;
}

// Detail

export interface ScholarVerificationBase {
  verificationId: string;
  scholarId: string;
  selectionMethod: "MatchedScholar" | "SelfSelection";
  status: DocVerificationStatus;
  rejectionReason?: string;
  basicInfo: {
    fullName: string;
    email: string;
    phone?: string;
  };
  sponsorId: string;
  scholarship: {
    id: string;
    title: string;
    category: string;
  };
}

export type ScholarVerificationDetail =
  | (ScholarVerificationBase & {
      source: "Profile";
      profile: any; // you can tighten this later
    })
  | (ScholarVerificationBase & {
      source: "Application";
      application: any; // snapshot stored on DocumentVerification
    });

export type SponsorVerificationListResp = {
  items: SponsorVerificationRow[];
  page: number;
  pageSize: number;
  total: number;
};

export type SponsorVerificationDetail = {
  sponsorId: string;
  verified: boolean;
  basicInfo: {
    fullName: string;
    email: string;
    phone?: string;
  };
  document: {
    idType?: string;
    uploadURL?: string;
    status: DocVerificationStatus;
    rejectionReason?: string;
    uploadedAt?: string;
  };
};

type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type SponsorVerificationRow = {
  sponsorId: string;
  name: string;
  email: string;
  purpose: string;
  status: DocVerificationStatus; 
  dateSent: string;
};

// payments

export type PaymentStatus = "pending" | "success" | "failed";

export type FundingPlanKey = "FOUR_YEARS" | "ANNUAL" | "QUARTERLY" | "MONTHLY";

export interface AdminPaymentSponsor {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface AdminPaymentScholarProfilePersonal {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface AdminPaymentScholarProfile {
  personal?: AdminPaymentScholarProfilePersonal;
  phone?: string;
}

export interface AdminPaymentScholar {
  _id: string;
  email?: string;
  phone?: string;
  profile?: AdminPaymentScholarProfile;
}

export interface AdminPayment {
  _id: string;
  reference: string;
  paystackReference?: string;
  status: PaymentStatus;
  plan: FundingPlanKey;

  scholarshipId: string;
  scholarshipTitle?: string;
  scholarshipCategory?: string;

  amount: number;
  scholarshipTotalAmount: number;
  outstanding: number;

  scholar: AdminPaymentScholar;
  sponsor: AdminPaymentSponsor;

  createdAt: string;
  updatedAt: string;

  // includes Paystack payload etc.
  meta?: unknown;
}

export interface PaginatedAdminPayments {
  items: AdminPayment[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export interface FundScholarRequest {
  scholarId: string;
  sponsorId: string;
  scholarshipId: string;
  amount?: number; // optional override
}

export interface FundScholarResponse {
  msg: string;
  payment: AdminPayment;
}

export interface AdminSettings {
  fullName: string;
  phoneNumber: string;
  avatarUrl: string | null;
}

export interface UpdateAdminSettingsPayload {
  fullName: string;
  phoneNumber: string;
}





const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      // Prefer Redux state token if you later add it, otherwise localStorage
      const state = getState() as RootState;
      const tokenFromState = (state as any)?.auth?.token as string | undefined;
      const token =
        tokenFromState ||
        (typeof window !== "undefined"
          ? localStorage.getItem("afro_admin_token") || undefined
          : undefined);

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
    //credentials: "include",
  }),
  tagTypes: [
    "Users",
    "Roles",
    "Scholars",
    "ScholarScholarships",
    "Sponsors",
    "ScholarVerifications",
    "SponsorVerifications",
    "AdminPayments",
    "AdminSettings",
  ],
  endpoints: (builder) => ({
    // ---------- Auth ----------
    login: builder.mutation<AdminLoginResponse, AdminLoginRequest>({
      query: (body) => ({
        url: "/admin/api/auth/login",
        method: "POST",
        body,
      }),
    }),

    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: "/admin/api/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<
      { message: string },
      { token: string; password: string }
    >({
      query: (body) => ({
        url: "/admin/api/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    // ---------- Users ----------
    getUsers: builder.query<PagedUsersResponse, { q?: string }>({
      query: ({ q }) => ({
        url: "/admin/api/users",
        params: q ? { q } : undefined, // backend supports ?q
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((u) => ({
                type: "Users" as const,
                id: u.id,
              })),
              { type: "Users" as const, id: "LIST" },
            ]
          : [{ type: "Users" as const, id: "LIST" }],
    }),

    createUser: builder.mutation<
      User,
      {
        name: string;
        email: string;
        phone?: string;
        password: string;
        roleTitle: Role;
      }
    >({
      query: (body) => ({
        url: "/admin/api/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    updateUser: builder.mutation<
      User,
      { id: string; name: string; email: string; phone?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/api/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "Users", id: arg.id },
        { type: "Users", id: "LIST" },
      ],
    }),

    toggleUserStatus: builder.mutation<AdminUserRow, string>({
      query: (id) => ({
        url: `/admin/api/users/${id}/status`,
        method: "PATCH",
      }),
    }),

    setUserRole: builder.mutation<User, { id: string; roleTitle: Role }>({
      query: ({ id, roleTitle }) => ({
        url: `/admin/api/users/${id}/role`,
        method: "PATCH",
        body: { roleTitle },
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "Users", id: arg.id },
        { type: "Users", id: "LIST" },
        { type: "Roles", id: "LIST" },
      ],
    }),

    // ---------- Roles ----------
    getRoles: builder.query<RoleDto[], void>({
      query: () => "/admin/api/roles",
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "Roles" as const, id: r._id })),
              { type: "Roles" as const, id: "LIST" },
            ]
          : [{ type: "Roles" as const, id: "LIST" }],
    }),

    createRole: builder.mutation<
      RoleDto,
      { title: Role; permissions: Permission[] }
    >({
      query: (body) => ({
        url: "/admin/api/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Roles", id: "LIST" }],
    }),

    deleteRole: builder.mutation<{ message: string }, { id: string }>({
      query: ({ id }) => ({
        url: `/admin/api/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Roles", id: "LIST" },
        { type: "Users", id: "LIST" },
      ],
    }),

    setRolePermissions: builder.mutation<
      RoleDto,
      { id: string; permissions: Permission[] }
    >({
      query: ({ id, permissions }) => ({
        url: `/admin/api/roles/${id}/permissions`,
        method: "PATCH",
        body: { permissions },
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "Roles", id: arg.id },
        { type: "Roles", id: "LIST" },
      ],
    }),
    registerSuperAdmin: builder.mutation<
      AuthResponse,
      RegisterSuperAdminPayload
    >({
      query: (body) => ({
        url: "/admin/api/auth/bootstrap-super-admin",
        method: "POST",
        body,
      }),
    }),
    getScholars: builder.query<
      Paged<AdminScholar>,
      AdminScholarListQuery | void
    >({
      query: (arg) => {
        const { page = 1, limit = 10, q, status } = arg ?? {};
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (q) params.set("q", q);
        if (status && status !== "All") params.set("status", status);
        return `/admin/api/scholars?${params.toString()}`;
      },
      providesTags: ["Scholars"],
    }),

    /* ===== SCHOLAR DETAILS ===== */
    getScholarById: builder.query<AdminScholarID, string>({
      query: (id) => `/admin/api/scholars/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Scholars", id }],
    }),

    updateScholarStatus: builder.mutation<
      AdminScholar,
      { id: string; status: AdminScholarStatus; deactivationReason?: string }
    >({
      query: ({ id, status, deactivationReason }) => ({
        url: `/admin/api/scholars/${id}/status`,
        method: "PATCH",
        body: { status, deactivationReason },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Scholars", id },
        "Scholars",
      ],
    }),

    /* ===== SCHOLARSHIPS TAB ===== */
    getScholarScholarships: builder.query<
      Paged<AdminScholarScholarship>,
      { id: string; page?: number; limit?: number }
    >({
      query: ({ id, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        return `/admin/api/scholars/${id}/scholarships?${params.toString()}`;
      },
      providesTags: (_r, _e, { id }) => [{ type: "ScholarScholarships", id }],
    }),

    //sponsors

    getSponsors: builder.query<
      any,
      { status?: string; search?: string; page?: number; limit?: number }
    >({
      query: ({ status, search, page = 1, limit = 20 }) => {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        if (search) params.set("search", search);
        params.set("page", String(page));
        params.set("limit", String(limit));
        return `/admin/api/sponsors?${params.toString()}`;
      },
      providesTags: ["Sponsors"],
    }),

    getSponsorById: builder.query<any, string>({
      query: (id) => `/admin/api/sponsors/${id}`,
      providesTags: (result, error, id) => [{ type: "Sponsors", id }],
    }),

    getSponsorScholarships: builder.query<any, { sponsorId: string }>({
      query: ({ sponsorId }) => `/admin/api/sponsors/${sponsorId}/scholarships`,
      providesTags: (result, error, arg) => [
        { type: "Sponsors", id: arg.sponsorId },
      ],
    }),

    getSponsorApplicants: builder.query<
      any,
      { sponsorId: string; scholarshipId?: string }
    >({
      query: ({ sponsorId, scholarshipId }) => {
        const params = new URLSearchParams();
        if (scholarshipId) params.set("scholarshipId", scholarshipId);
        return `/admin/api/sponsors/${sponsorId}/applicants?${params.toString()}`;
      },
      providesTags: (result, error, arg) => [
        { type: "Sponsors", id: arg.sponsorId },
      ],
    }),

    getSponsorTransactions: builder.query<
      any,
      { sponsorId: string; page?: number; limit?: number }
    >({
      query: ({ sponsorId, page = 1, limit = 20 }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        return `/admin/api/sponsors/${sponsorId}/transactions?${params.toString()}`;
      },
      providesTags: (result, error, arg) => [
        { type: "Sponsors", id: arg.sponsorId },
      ],
    }),

    getScholarOverview: builder.query<any, string>({
      query: (scholarId) =>
        `/admin/api/sponsors/scholars/${scholarId}/overview`,
      providesTags: (result, error, id) => [{ type: "Scholars", id }],
    }),

    updateScholarStatuss: builder.mutation<
      any,
      { scholarId: string; status: string; reason?: string }
    >({
      query: ({ scholarId, ...body }) => ({
        url: `/admin/api/sponsors/scholars/${scholarId}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Scholars", id: arg.scholarId },
      ],
    }),
    getSponsorScholarshipById: builder.query<
      any,
      { sponsorId: string; scholarshipId: string }
    >({
      query: ({ sponsorId, scholarshipId }) =>
        `/admin/api/sponsors/${sponsorId}/scholarships/${scholarshipId}`,
      providesTags: (result, error, arg) => [
        { type: "Sponsors", id: arg.sponsorId },
      ],
    }),
    // document verification
    getScholarVerifications: builder.query<
      Paginated<ScholarVerificationRow>,
      { page?: number; status?: "all" | DocVerificationStatus }
    >({
      query: ({ page = 1, status = "all" }) =>
        `/admin/api/document-verifications/scholars?page=${page}&status=${status}`,
      transformResponse: (resp: {
        message: string;
        data: Paginated<ScholarVerificationRow>;
      }) => resp.data,
      providesTags: ["ScholarVerifications"],
    }),

    //  sponsor verifications – make sure we unwrap `.data` to match the scholar endpoint
    getSponsorVerifications: builder.query<
      Paginated<SponsorVerificationRow>,
      { page?: number }
    >({
      query: ({ page = 1 } = {}) =>
        `/admin/api/document-verifications/sponsors?page=${page}`,
      transformResponse: (resp: {
        message: string;
        data: Paginated<SponsorVerificationRow>;
      }) => resp.data,
      providesTags: ["SponsorVerifications"],
    }),

    //  Scholar verification detail
    getScholarVerificationDetail: builder.query<
      ScholarVerificationDetail,
      string
    >({
      query: (verificationId) => ({
        url: `/admin/api/document-verifications/scholars/${verificationId}`,
        method: "GET",
      }),
      transformResponse: (resp: {
        message: string;
        data: ScholarVerificationDetail;
      }) => resp.data,
      providesTags: (_res, _err, id) => [
        { type: "ScholarVerifications" as const, id },
      ],
    }),

    // 🔹 Accept documents
    acceptScholarDocuments: builder.mutation<any, string>({
      query: (verificationId) => ({
        url: `/admin/api/document-verifications/scholars/${verificationId}/accept`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "ScholarVerifications" as const, id },
        { type: "ScholarVerifications" as const, id: "LIST" },
      ],
    }),

    // 🔹 Reject documents
    rejectScholarDocuments: builder.mutation<
      any,
      { verificationId: string; reason: string }
    >({
      query: ({ verificationId, reason }) => ({
        url: `/admin/api/document-verifications/scholars/${verificationId}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_res, _err, { verificationId }) => [
        { type: "ScholarVerifications" as const, id: verificationId },
        { type: "ScholarVerifications" as const, id: "LIST" },
      ],
    }),

    // 🔹 Verify scholar (after docs are accepted)
    verifyScholar: builder.mutation<any, string>({
      query: (scholarId) => ({
        url: `/admin/api/document-verifications/scholars/${scholarId}/verify`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "ScholarVerifications" as const, id: "LIST" }],
    }),

    getSponsorVerificationDetail: builder.query<
      SponsorVerificationDetail,
      string
    >({
      query: (sponsorId) =>
        `/admin/api/document-verifications/sponsors/${sponsorId}`,
    }),

    verifySponsor: builder.mutation<{ message: string }, string>({
      query: (sponsorId) => ({
        url: `/admin/api/document-verifications/sponsors/${sponsorId}/verify`,
        method: "POST",
      }),
      invalidatesTags: ["SponsorVerifications"],
    }),

    rejectSponsorVerification: builder.mutation<
      { message: string },
      { sponsorId: string; reason: string }
    >({
      query: ({ sponsorId, reason }) => ({
        url: `/admin/api/document-verifications/sponsors/${sponsorId}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["SponsorVerifications"],
    }),
    // payment module

    getAdminPayments: builder.query<
      PaginatedAdminPayments,
      { page?: number; pageSize?: number } | void
    >({
      query: (params) => {
        const page = params?.page ?? 1;
        const pageSize = params?.pageSize ?? 10;
        return `/admin/api/payments?page=${page}&pageSize=${pageSize}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((p) => ({
                type: "AdminPayments" as const,
                id: p._id,
              })),
              { type: "AdminPayments" as const, id: "LIST" },
            ]
          : [{ type: "AdminPayments" as const, id: "LIST" }],
    }),

    getAdminPaymentById: builder.query<AdminPayment, string>({
      query: (id) => `/admin/api/payments/${id}`,
      providesTags: (_res, _err, id) => [{ type: "AdminPayments", id }],
    }),

    fundScholar: builder.mutation<FundScholarResponse, FundScholarRequest>({
      query: (body) => ({
        url: "/admin/api/payments/fund",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AdminPayments", id: "LIST" }],
    }),
    //settings
    // ========== ADMIN SETTINGS ==========
    getAdminSettings: builder.query<AdminSettings, void>({
      query: () => "/admin/api/settings",
      providesTags: ["AdminSettings"],
    }),

    updateAdminSettings: builder.mutation<
      { message: string; fullName: string; phoneNumber: string },
      UpdateAdminSettingsPayload
    >({
      query: (body) => ({
        url: "/admin/api/settings",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: ["AdminSettings"],
    }),

    uploadAdminAvatar: builder.mutation<
      { message: string; avatarUrl: string },
      FormData
    >({
      query: (formData) => ({
        url: "/admin/api/settings/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["AdminSettings"],
    }),

    removeAdminAvatar: builder.mutation<
      { message: string; avatarUrl: string | null },
      void
    >({
      query: () => ({
        url: "/admin/api/settings/avatar",
        method: "DELETE",
      }),
      invalidatesTags: ["AdminSettings"],
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
  useSetUserRoleMutation,
  useGetRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useSetRolePermissionsMutation,
  useRegisterSuperAdminMutation,

  //scholars

  useGetScholarsQuery,
  useGetScholarByIdQuery,
  useUpdateScholarStatusMutation,
  useGetScholarScholarshipsQuery,

  //sponsors
  useGetSponsorsQuery,
  useGetSponsorByIdQuery,
  useGetSponsorScholarshipsQuery,
  useGetSponsorApplicantsQuery,
  useGetSponsorTransactionsQuery,
  useGetScholarOverviewQuery,
  useUpdateScholarStatussMutation,
  useGetSponsorScholarshipByIdQuery,

  // document verification
  useGetScholarVerificationsQuery,
  useGetScholarVerificationDetailQuery,
  useAcceptScholarDocumentsMutation,
  useRejectScholarDocumentsMutation,
  useVerifyScholarMutation,
  useGetSponsorVerificationsQuery,
  useGetSponsorVerificationDetailQuery,
  useVerifySponsorMutation,
  useRejectSponsorVerificationMutation,

  // payment module
  useGetAdminPaymentsQuery,
  useLazyGetAdminPaymentsQuery,
  useGetAdminPaymentByIdQuery,
  useFundScholarMutation,

  // settings
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  useUploadAdminAvatarMutation,
  useRemoveAdminAvatarMutation,
} = adminApi;
