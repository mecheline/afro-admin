import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { ROLE_PERMISSIONS, type Permission, type Role } from "@/auth/rbac";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string; // for header/profile picture
  role: Role;
  permissions: Permission[];
  status?: "Active" | "Inactive";
  createdAt?: string;
};

type AuthState = {
  user: User | null;

  /** Optional: local cache for UI-only use (most real data should come from API) */
  users: User[];
  roles: { id: string; title: Role; assignedUserIds: string[] }[];
};

// Fallback ID generator for environments without crypto.randomUUID
const genId = () =>
  globalThis.crypto && "randomUUID" in globalThis.crypto
    ? globalThis.crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// ✅ No more seed users/roles – everything comes from backend now
const initialState: AuthState = {
  user: null,
  users: [],
  roles: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set/clear the currently logged-in admin
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },

    // The rest of these are optional helpers – only used if your UI
    // still dispatches them. They no longer rely on any seed data.
    addUser(state, action: PayloadAction<Omit<User, "permissions">>) {
      const payload = action.payload;
      const u: User = {
        ...payload,
        permissions: ROLE_PERMISSIONS[payload.role],
      };
      state.users.push(u);
      const roleBucket = state.roles.find((r) => r.title === u.role);
      if (roleBucket && !roleBucket.assignedUserIds.includes(u.id)) {
        roleBucket.assignedUserIds.push(u.id);
      }
    },

    updateUser(state, action: PayloadAction<User>) {
      const i = state.users.findIndex((x) => x.id === action.payload.id);
      if (i >= 0) state.users[i] = action.payload;
    },

    setUserRole(state, action: PayloadAction<{ userId: string; role: Role }>) {
      const actor = state.user;
      if (!actor || actor.role !== "SUPER_ADMIN") return; // enforce

      const u = state.users.find((x) => x.id === action.payload.userId);
      if (!u) return;

      // remove from old role bucket
      const old = state.roles.find((r) => r.title === u.role);
      if (old)
        old.assignedUserIds = old.assignedUserIds.filter((id) => id !== u.id);

      // set new role + derived perms
      u.role = action.payload.role;
      u.permissions = ROLE_PERMISSIONS[action.payload.role];

      // add to new role bucket
      const bucket = state.roles.find((r) => r.title === u.role);
      if (bucket && !bucket.assignedUserIds.includes(u.id)) {
        bucket.assignedUserIds.push(u.id);
      }
    },

    toggleUserStatus(state, action: PayloadAction<{ userId: string }>) {
      const u = state.users.find((x) => x.id === action.payload.userId);
      if (u) u.status = u.status === "Active" ? "Inactive" : "Active";
    },

    createRole(state, action: PayloadAction<Role>) {
      if (state.roles.some((r) => r.title === action.payload)) return;
      state.roles.push({
        id: genId(),
        title: action.payload,
        assignedUserIds: [],
      });
    },

    deleteRole(state, action: PayloadAction<Role>) {
      // prevent removing built-ins SUPER_ADMIN/ADMIN/LSO (demo rule)
      if (["SUPER_ADMIN", "ADMIN", "LSO"].includes(action.payload)) return;

      state.roles = state.roles.filter((r) => r.title !== action.payload);

      // reassign users of deleted role to LSO by default
      state.users = state.users.map((u) =>
        u.role === action.payload
          ? { ...u, role: "LSO", permissions: ROLE_PERMISSIONS.LSO }
          : u
      );
    },
  },
});

export const {
  setUser,
  addUser,
  updateUser,
  setUserRole,
  toggleUserStatus,
  createRole,
  deleteRole,
} = authSlice.actions;

export default authSlice.reducer;
