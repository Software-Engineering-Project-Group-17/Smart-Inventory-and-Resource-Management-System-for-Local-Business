// Navigation constants for role-based user creation

export const ROLE_CREATION_ROUTES = {
  OWNER: "/admin/owner-creation",
  MANAGER: "/admin/manager-creation",
  STAFF: "/admin/staff-creation",
} as const;

export const ROLE_PERMISSIONS = {
  OWNER_CREATION: ["SYSTEM_ADMIN"], // Special system admin only
  MANAGER_CREATION: ["OWNER"],
  STAFF_CREATION: ["OWNER", "MANAGER"],
} as const;

export const ROLE_DESCRIPTIONS = {
  OWNER: "Full system access, can create managers",
  MANAGER: "Can manage staff and branch operations",
  STAFF: "Branch, inventory, resource, sales, or general employee roles",
} as const;

// Helper function to check if user can create a specific role
export const canCreateRole = (
  userRole: string,
  targetRole: keyof typeof ROLE_CREATION_ROUTES
): boolean => {
  switch (targetRole) {
    case "OWNER":
      return false; // Only system admin with secret key
    case "MANAGER":
      return userRole === "OWNER";
    case "STAFF":
      return userRole === "OWNER" || userRole === "MANAGER";
    default:
      return false;
  }
};
