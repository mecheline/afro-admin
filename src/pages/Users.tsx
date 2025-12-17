import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import Modal from "@/ui/Modal";
import Chip from "@/ui/Chip";
import { StatusBadge } from "@/ui/Badge";
import type { RootState } from "@/state/store";
import type { Role as RoleTitle } from "@/auth/rbac";
import type { User } from "@/state/authSlice";

// RTK Query admin API hooks
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
  useGetRolesQuery,
  useSetUserRoleMutation,
} from "@/state/adminApi";

type AdminUserRow = User & { status: "Active" | "Inactive" };

type RoleDto = {
  _id: string;
  title: RoleTitle;
  permissions?: string[];
};

const Users: React.FC = () => {
  const { user: me } = useSelector((s: RootState) => s.auth);

  // raw input text
  const [search, setSearch] = useState("");
  // debounced search (used for actual filtering)
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState<AdminUserRow | null>(null);
  const [openStatusModal, setOpenStatusModal] = useState<AdminUserRow | null>(
    null
  );

  // 🔁 3-second debounce
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
    }, 3000);

    return () => clearTimeout(id);
  }, [search]);

  // ---- RTK Query: Users (no q param – we fetch once and filter on client) ----
  const {
    data: usersResp,
    isLoading,
    isError,
    refetch,
  } = useGetUsersQuery({ q: "" }, { refetchOnMountOrArgChange: true });

  const users: AdminUserRow[] = useMemo(
    () => (usersResp?.items as AdminUserRow[]) || [],
    [usersResp]
  );

  const totalCount = usersResp?.totalCount ?? users.length;

  // ✅ Client-side filter by name, email, role, status using debouncedSearch
  const filteredUsers = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = u.name?.toLowerCase() ?? "";
      const email = u.email?.toLowerCase() ?? "";
      const role = (u.role as string | undefined)?.toLowerCase() ?? "";
      const status = (u.status as string | undefined)?.toLowerCase() ?? "";

      return (
        name.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        status.includes(q)
      );
    });
  }, [users, debouncedSearch]);

  // ---- RTK Query: Roles (for role selects) ----
  const { data: rolesResp } = useGetRolesQuery();
  const roles: RoleDto[] = (rolesResp as RoleDto[]) || [];

  // ---- RTK Mutations ----
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [toggleStatus, { isLoading: toggling }] = useToggleUserStatusMutation();
  const [setUserRole, { isLoading: settingRole }] = useSetUserRoleMutation();

  const handleOpenStatusModal = (u: AdminUserRow) => {
    // prevent deactivating self
    if (me?.id === u.id) return;
    // prevent deactivating SUPER_ADMIN
    if (u.role === "SUPER_ADMIN") return;
    setOpenStatusModal(u);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Users{" "}
          <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
            {totalCount}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            Export
          </button>
          <button
            onClick={() => setOpenNew(true)}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
          >
            New User
          </button>
        </div>
      </div>

      {/* Search / filters */}
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, role or status"
            className="h-10 w-full bg-transparent outline-none"
          />
        </div>
        <button className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          Filter
        </button>
        <button className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          List
        </button>
        <button className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          Grid
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" />
              </th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone Number</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date Added</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                  Loading users...
                </td>
              </tr>
            )}

            {isError && !isLoading && (
              <tr>
                <td className="px-4 py-6 text-center text-red-500" colSpan={8}>
                  Failed to load users.
                </td>
              </tr>
            )}

            {!isLoading && !isError && filteredUsers.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                  No users found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              filteredUsers.map((u) => {
                const isSelf = me?.id === u.id;
                const isSuperAdmin = u.role === "SUPER_ADMIN";
                const isActive = u.status === "Active";

                const canToggle = !isSelf && !isSuperAdmin;

                return (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-3">
                      <input type="checkbox" />
                    </td>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">
                      <Chip>{u.email}</Chip>
                    </td>
                    <td className="px-4 py-3">{u.phone}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.status ?? "Active"} />
                    </td>
                    <td className="px-4 py-3">
                      {new Date(u.createdAt ?? Date.now()).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => setOpenEdit(u)}
                          className="rounded-md border px-2 py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => canToggle && handleOpenStatusModal(u)}
                          disabled={!canToggle}
                          className={`rounded-md border px-2 py-1 ${
                            !canToggle ? "cursor-not-allowed opacity-60" : ""
                          }`}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Add New User Modal */}
      <AddUserModal
        open={openNew}
        roles={roles}
        loading={creating}
        onClose={() => setOpenNew(false)}
        onCreate={async (payload) => {
          await createUser(payload).unwrap();
          await refetch();
          setOpenNew(false);
        }}
      />

      {/* Edit User Modal */}
      {openEdit && (
        <EditUserModal
          user={openEdit}
          roles={roles}
          canAssign={me?.role === "SUPER_ADMIN"}
          loading={updating || settingRole}
          onClose={() => setOpenEdit(null)}
          onSave={async (updated) => {
            // update basic fields
            await updateUser({
              id: updated.id,
              name: updated.name,
              email: updated.email,
              phone: updated.phone,
            }).unwrap();

            // if role changed and current user is allowed, update role
            if (
              updated.role &&
              updated.role !== openEdit.role &&
              me?.role === "SUPER_ADMIN"
            ) {
              await setUserRole({
                id: updated.id,
                roleTitle: updated.role as RoleTitle,
              }).unwrap();
            }

            await refetch();
            setOpenEdit(null);
          }}
        />
      )}

      {/* Activate / Deactivate Modal */}
      {openStatusModal && (
        <StatusToggleModal
          user={openStatusModal}
          toggling={toggling}
          onClose={() => setOpenStatusModal(null)}
          onConfirm={async () => {
            await toggleStatus(openStatusModal.id).unwrap();
            await refetch();
            setOpenStatusModal(null);
          }}
        />
      )}
    </div>
  );
};

export default Users;

/* ------------------------------------------------------------------ */
/* Activate / Deactivate Modal                                        */
/* ------------------------------------------------------------------ */

const StatusToggleModal: React.FC<{
  user: AdminUserRow;
  toggling: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}> = ({ user, toggling, onClose, onConfirm }) => {
  const isActive = user.status === "Active";

  const title = isActive ? "Deactivate User" : "Activate User";
  const description = isActive
    ? "This will deactivate the user and prevent them from accessing their account. You can always activate them later."
    : "This will activate the user and restore access to their account.";
  const primaryLabel = toggling
    ? "Working..."
    : isActive
    ? "Yes, Deactivate User"
    : "Yes, Activate User";

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={title}
      description={description}
      primary={{
        label: primaryLabel,
        onClick: onConfirm,
        variant: isActive ? "danger" : "primary",
      }}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Add User Modal (no permissions UI – role only)                     */
/* ------------------------------------------------------------------ */

const AddUserModal: React.FC<{
  open: boolean;
  onClose: () => void;
  roles: RoleDto[];
  loading?: boolean;
  onCreate: (payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    roleTitle: RoleTitle;
  }) => Promise<void> | void;
}> = ({ open, onClose, roles, loading, onCreate }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [roleTitle, setRoleTitle] = useState<RoleTitle>("LSO");

  const reset = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRoleTitle("LSO");
  };

  const handleCreate = async () => {
    if (!fullName || !email || !password || !roleTitle) return;

    await onCreate({
      name: fullName,
      email,
      phone,
      password,
      roleTitle,
    });
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add New User"
      primary={{
        label: loading ? "Adding..." : "Add User",
        onClick: handleCreate,
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Full name</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="First and Last name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Official Email</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="jaydenifaka@afroscholar.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Phone Number</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="080..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Temporary Password</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Enter a temporary password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Role</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value as RoleTitle)}
          >
            {roles.map((r) => (
              <option
                key={r._id}
                value={r.title}
                disabled={r.title === "SUPER_ADMIN"}
              >
                {r.title === "ADMIN"
                  ? "Admin"
                  : r.title === "LSO"
                  ? "LSO"
                  : "Super Admin"}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Edit User Modal (can change role only if SUPER_ADMIN)              */
/* ------------------------------------------------------------------ */

const EditUserModal: React.FC<{
  user: AdminUserRow;
  roles: RoleDto[];
  onClose: () => void;
  onSave: (u: AdminUserRow) => Promise<void> | void;
  canAssign: boolean;
  loading?: boolean;
}> = ({ user, roles, onClose, onSave, canAssign, loading }) => {
  const [fullName, setFullName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [role, setRole] = useState<RoleTitle>(
    (user.role as RoleTitle) ?? "LSO"
  );

  const handleSave = async () => {
    await onSave({
      ...user,
      name: fullName,
      email,
      phone,
      role,
    });
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Edit User"
      primary={{
        label: loading ? "Saving..." : "Save Changes",
        onClick: handleSave,
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Full name</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Official Email</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Phone Number</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Role</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleTitle)}
            disabled={!canAssign}
          >
            {roles.map((r) => (
              <option key={r._id} value={r.title}>
                {r.title === "ADMIN"
                  ? "Admin"
                  : r.title === "LSO"
                  ? "LSO"
                  : "Super Admin"}
              </option>
            ))}
          </select>
          {!canAssign && (
            <p className="mt-1 text-xs text-gray-500">
              Only Super Admin can change user roles.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
