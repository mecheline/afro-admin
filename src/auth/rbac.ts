

export type Role = "SUPER_ADMIN" | "ADMIN" | "LSO";

// Sidebar permissions (one per nav item)
export type Permission =
  | "SCHOLARS"
  | "SPONSORS"
  | "DOC_VERIFICATIONS"
  | "PAYMENTS"
  | "USERS"
  | "ROLES_PERMISSIONS"
  | "SETTINGS";

export const ALL_PERMS: Permission[] = [
  "SCHOLARS",
  "SPONSORS",
  "DOC_VERIFICATIONS",
  "PAYMENTS",
  "USERS",
  "ROLES_PERMISSIONS",
  "SETTINGS",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: ALL_PERMS,
  ADMIN: [
    "SCHOLARS",
    "SPONSORS",
    "DOC_VERIFICATIONS",
    "PAYMENTS",
    "SETTINGS",
  ],
  LSO: ["SCHOLARS", "DOC_VERIFICATIONS", "SETTINGS"],
};
