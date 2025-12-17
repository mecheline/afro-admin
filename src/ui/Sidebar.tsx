import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import type { Permission } from "@/auth/rbac";
import type { RootState } from "@/state/store";
import { useLogout } from "@/hooks/useLogout";
import ConfirmLogoutModal from "@/components/modals/ConfirmLogoutModal";

// 👇 make this exported so Header can reuse it
export const NAV: { key: Permission; label: string; to: string }[] = [
  { key: "SCHOLARS", label: "Scholars", to: "/scholars" },
  { key: "SPONSORS", label: "Sponsors", to: "/sponsors" },
  {
    key: "DOC_VERIFICATIONS",
    label: "Document Verifications",
    to: "/verifications",
  },
  { key: "PAYMENTS", label: "Payments", to: "/payments" },
  { key: "USERS", label: "Users", to: "/users" },
  { key: "ROLES_PERMISSIONS", label: "Roles & Permission", to: "/roles" },
  { key: "SETTINGS", label: "Settings", to: "/settings" },
];

const Sidebar: React.FC = () => {
  const me = useSelector((s: RootState) => s.auth.user);
  const allowed = new Set(me?.permissions ?? []);

  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const logout = useLogout();

  const handleContinue = async () => {
    setBusy(true);
    try {
      await logout(); //  trigger the hook only after confirm
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <aside className="hidden border-r border-gray-200 bg-white lg:block">
      <div className="sticky top-0 flex h-screen w-[var(--sidebar-w)] flex-col">
        <div className="flex h-16 items-center px-4 text-lg font-semibold text-blue-700">
          afroscholars
        </div>
        <nav className="space-y-1 px-3">
          {NAV.filter((n) => allowed.has(n.key)).map((n) => (
            <NavLink
              key={n.key}
              to={n.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-3 py-4 text-sm text-gray-500">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white"
          >
            Logout
          </button>
          <div className="mt-4">
            {me ? `${me.name} • ${me.role}` : "Not signed in"}
          </div>
        </div>
      </div>
      <ConfirmLogoutModal
        open={open}
        onClose={() => (busy ? null : setOpen(false))}
        onContinue={handleContinue}
        isLoading={busy}
      />
    </aside>
  );
};

export default Sidebar;
