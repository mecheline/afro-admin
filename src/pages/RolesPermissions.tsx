import React, { useMemo, useState } from "react";

import {
  ALL_PERMS,
  ROLE_PERMISSIONS,
  type Permission,
  type Role,
} from "@/auth/rbac";

import Modal from "@/ui/Modal";
import type { RootState } from "@/state/store";

// 🔗 RTK Query hooks for roles (adjust path/names if needed)
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
} from "@/state/adminApi";

const RolesPermissions: React.FC = () => {
  const [tab, setTab] = useState<"roles" | "permissions">("roles");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Roles & Permission </h2>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            Export
          </button>
          {tab === "roles" && <NewRoleButton />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setTab("roles")}
          className={`-mb-px border-b-2 px-2 py-2 text-sm ${
            tab === "roles"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-gray-500"
          }`}
        >
          All roles
        </button>
        <button
          onClick={() => setTab("permissions")}
          className={`-mb-px border-b-2 px-2 py-2 text-sm ${
            tab === "permissions"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-gray-500"
          }`}
        >
          Permissions
        </button>
      </div>

      {tab === "roles" ? <RolesTab /> : <PermissionsTab />}
    </div>
  );
};

export default RolesPermissions;

/* ------------------------------------------------------------------ */
/* Shared labels                                                      */
/* ------------------------------------------------------------------ */

const PERMISSION_LABELS: Record<Permission, string> = {
  SCHOLARS: "Scholars",
  SPONSORS: "Sponsors",
  DOC_VERIFICATIONS: "Document Verifications",
  PAYMENTS: "Payments",
  USERS: "Users",
  ROLES_PERMISSIONS: "Roles & Permission",
  SETTINGS: "Settings",
};

/* ------------------------------------------------------------------ */
/* New Role Button + Modal (role + permissions, no assigned users UI) */
/* ------------------------------------------------------------------ */

const NewRoleButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>("LSO");
  const [selectedPerms, setSelectedPerms] = useState<Permission[]>(
    ROLE_PERMISSIONS.LSO
  );

  const [createRole, { isLoading }] = useCreateRoleMutation();

  const handleRoleChange = (nextRole: Role) => {
    setRole(nextRole);
    // default permissions based on the base mapping for that role
    setSelectedPerms(ROLE_PERMISSIONS[nextRole]);
  };

  const togglePerm = (perm: Permission) => {
    setSelectedPerms((curr) =>
      curr.includes(perm) ? curr.filter((p) => p !== perm) : [...curr, perm]
    );
  };

  const handleSave = async () => {
    // send to backend: title + permissions
    await createRole({ title: role, permissions: selectedPerms }).unwrap();
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
      >
        New Role
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create New Role"
        primary={{
          label: isLoading ? "Saving..." : "Save",
          onClick: handleSave,
        }}
        widthClass="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">Role</label>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="LSO">LSO</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN" disabled>
                Super Admin
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm">Permissions</label>
            <div className="grid grid-cols-1 gap-2 rounded-xl border p-3 sm:grid-cols-2">
              {ALL_PERMS.map((perm) => (
                <label key={perm} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedPerms.includes(perm)}
                    onChange={() => togglePerm(perm)}
                  />
                  <span>{PERMISSION_LABELS[perm]}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Permissions are attached to the role. Users will inherit these
              permissions based on the role you assign to them.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Roles tab – roles from API, delete via API                         */
/* ------------------------------------------------------------------ */

type ApiRole = {
  _id: string;
  title: Role;
  permissions: Permission[];
  assignedUsers?: string[]; // array of user ids
};

const RolesTab: React.FC = () => {
  const [query, setQuery] = useState("");
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  const { data: roles, isLoading, isError } = useGetRolesQuery();
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();

  const filtered = useMemo(
    () =>
      (roles || []).filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase())
      ),
    [roles, query]
  );

  const handleConfirmDelete = async () => {
    if (!deleteRoleId) return;
    await deleteRole({ id: deleteRoleId }).unwrap();
    setDeleteRoleId(null);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center rounded-lg border border-gray-200 bg-white px-3">
          <svg
            className="mr-2 text-gray-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search role by title"
            className="h-10 w-full bg-transparent outline-none"
          />
        </div>
        <button className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          Filter
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" />
              </th>
              <th className="px-4 py-3">Role Title</th>
              <th className="px-4 py-3">Assigned Users</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                  Loading roles...
                </td>
              </tr>
            )}

            {isError && !isLoading && (
              <tr>
                <td className="px-4 py-6 text-center text-red-500" colSpan={4}>
                  Failed to load roles.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              filtered.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="px-4 py-3">
                    <input type="checkbox" />
                  </td>
                  <td className="px-4 py-3">{r.title}</td>
                  <td className="px-4 py-3">
                    {r.assignedUsers ? r.assignedUsers.length : 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      {/* Edit hook left for later */}
                      <button className="rounded-md border px-2 py-1">
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteRoleId(r._id)}
                        className="rounded-md border px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!isLoading &&
              !isError &&
              filtered.length === 0 &&
              (roles || []).length > 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={4}
                  >
                    No roles match your search.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {deleteRoleId && (
        <Modal
          open={true}
          onClose={() => setDeleteRoleId(null)}
          title="Delete Role"
          description="Are you sure you want to delete this role?"
          primary={{
            label: deleting ? "Deleting..." : "Yes, Delete",
            onClick: handleConfirmDelete,
            variant: "danger",
          }}
        />
      )}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Permissions tab – read-only overview (no “set permissions” feature)*/
/* ------------------------------------------------------------------ */

const PermissionsTab: React.FC = () => {
  const { data: roles } = useGetRolesQuery();

  const byPermission = useMemo(() => {
    const map = new Map<Permission, { roles: Role[]; userCount: number }>();

    // init all permissions
    for (const p of ALL_PERMS) {
      map.set(p, { roles: [], userCount: 0 });
    }

    (roles || []).forEach((r: ApiRole) => {
      (r.permissions || []).forEach((perm) => {
        const entry = map.get(perm as Permission);
        if (!entry) return;
        if (!entry.roles.includes(r.title)) {
          entry.roles.push(r.title);
        }
        entry.userCount += r.assignedUsers?.length || 0;
      });
    });

    return map;
  }, [roles]);

  const items = Array.from(byPermission.entries());

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Permissions are attached to roles. This is a read-only overview of which
        roles (and how many users) currently have each permission.
      </p>

      <div className="space-y-4">
        {items.map(([perm, info]) => (
          <div key={perm} className="rounded-xl border bg-white p-4">
            <h4 className="text-sm font-semibold">{PERMISSION_LABELS[perm]}</h4>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs text-gray-500">Roles</div>
                <div className="text-sm">
                  {info.roles.length
                    ? info.roles.join(", ")
                    : "No roles currently have this permission."}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total Users</div>
                <div className="text-sm">
                  {info.userCount} user{info.userCount === 1 ? "" : "s"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
