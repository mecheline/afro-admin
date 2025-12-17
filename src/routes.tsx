import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminShell from "@/layouts/AdminShell";
import Login from "@/pages/auth/Login";
import Users from "@/pages/Users";
import RolesPermissions from "@/pages/RolesPermissions";
import SuperAdminSetup from "./pages/SuperAdminSetup";
import AdminScholarsListPage from "./pages/AdminScholarsListPage";
import AdminScholarDetailsPage from "./pages/AdminScholarDetailsPage";
import SponsorsList from "./pages/sponsors/SponsorsList";
import SponsorDetails from "./pages/sponsors/SponsorDetails";
import ScholarshipDetails from "./pages/sponsors/ScholarshipDetails";
import DocumentVerificationsPage from "./pages/verifications/DocumentVerificationsPage";
import ScholarVerificationDetailPage from "./pages/verifications/ScholarVerificationDetailPage";
import SponsorVerificationDetailPage from "./pages/verifications/SponsorVerificationDetailPage";
import AdminPaymentsPage from "./pages/payments/AdminPaymentsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <div className="rounded-xl border bg-white p-6 text-gray-600">
    {label} (coming soon)
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/setup-super-admin" element={<SuperAdminSetup />} />
      <Route
        path=""
        element={
          <AdminShell>
            <Navigate to="/scholars" />
          </AdminShell>
        }
      />
      <Route
        path="/users"
        element={
          <AdminShell>
            <Users />
          </AdminShell>
        }
      />
      <Route
        path="/roles"
        element={
          <AdminShell>
            <RolesPermissions />
          </AdminShell>
        }
      />
      {/* Stubs for sidebar destinations so nav doesn't 404 */}
      {/* ✅ Scholars list */}
      <Route
        path="/scholars"
        element={
          <AdminShell>
            <AdminScholarsListPage />
          </AdminShell>
        }
      />
      {/* ✅ Scholar details (matches /scholars/:id from UI & controller) */}
      <Route
        path="/scholars/:id"
        element={
          <AdminShell>
            <AdminScholarDetailsPage />
          </AdminShell>
        }
      />
      {/* NEW: Sponsors routes */}
      <Route
        path="/sponsors"
        element={
          <AdminShell>
            <SponsorsList />
          </AdminShell>
        }
      />
      <Route
        path="/sponsors/:sponsorId"
        element={
          <AdminShell>
            <SponsorDetails />
          </AdminShell>
        }
      />
      <Route
        path="/sponsors/:sponsorId/scholarships/:scholarshipId"
        element={
          <AdminShell>
            <ScholarshipDetails />
          </AdminShell>
        }
      />
      <Route
        path="/verifications"
        element={
          <AdminShell>
            <DocumentVerificationsPage />
          </AdminShell>
        }
      />
      <Route
        path="/verifications/scholars/:verificationId"
        element={
          <AdminShell>
            <ScholarVerificationDetailPage />
          </AdminShell>
        }
      />

      <Route
        path="/verifications/sponsors/:sponsorId"
        element={
          <AdminShell>
            <SponsorVerificationDetailPage />
          </AdminShell>
        }
      />
      <Route
        path="/payments"
        element={
          <AdminShell>
            <AdminPaymentsPage />
          </AdminShell>
        }
      />
      <Route
        path="/settings"
        element={
          <AdminShell>
            <SettingsPage />
          </AdminShell>
        }
      />
      <Route
        path="*"
        element={
          <AdminShell>
            <Placeholder label="Not Found" />
          </AdminShell>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
