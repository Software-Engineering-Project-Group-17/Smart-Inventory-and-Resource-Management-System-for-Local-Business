// Authentication utility functions

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePictureUrl: string;
  role: string;
  isActive: boolean;
  subscriptionStatus: string;
  subscriptionExpiresAt: string;
  createdAt: string;
  lastLoginAt: string;
}

// Get user profile from localStorage
export const getUserProfile = (): UserProfile | null => {
  if (typeof window === "undefined") return null;

  try {
    const userProfile = localStorage.getItem("userProfile");
    return userProfile ? JSON.parse(userProfile) : null;
  } catch (error) {
    console.error("Error parsing user profile:", error);
    return null;
  }
};

// Get user role
export const getUserRole = (): string | null => {
  const profile = getUserProfile();
  return profile?.role || null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("token");
  const profile = getUserProfile();
  return !!(token && profile);
};

// Check if user has specific role
export const hasRole = (requiredRole: string): boolean => {
  const userRole = getUserRole();
  return userRole?.toUpperCase() === requiredRole.toUpperCase();
};

// Check if user has any of the specified roles
export const hasAnyRole = (roles: string[]): boolean => {
  const userRole = getUserRole();
  if (!userRole) return false;

  return roles.some((role) => role.toUpperCase() === userRole.toUpperCase());
};

// Clear authentication data
export const clearAuthData = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("userProfile");
  localStorage.removeItem("uid");
};

// Get default redirect path based on role
export const getDefaultRedirectPath = (role: string): string => {
  switch (role.toUpperCase()) {
    case "OWNER":
      return "/branches";
    case "MANAGER":
    case "BRANCH_MANAGER":
      return "/branches";
    case "STAFF":
      return "/inventory";
    case "RESOURCE_MANAGER":
      return "/resources";
    case "INVENTORY_MANAGER":
      return "/inventory";
    case "SALES_MANAGER":
      return "/profile";
    case "SUPPLIER":
      return "/profile";
    case "CUSTOMER":
      return "/profile";
    default:
      return "/profile";
  }
};

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  OWNER: 100,
  ADMIN: 90,
  MANAGER: 70,
  BRANCH_MANAGER: 70,
  SALES_MANAGER: 60,
  INVENTORY_MANAGER: 60,
  RESOURCE_MANAGER: 60,
  STAFF: 50,
  SUPPLIER: 30,
  CUSTOMER: 10,
};

// Check if user has sufficient permissions
export const hasPermissionLevel = (requiredLevel: number): boolean => {
  const userRole = getUserRole();
  if (!userRole) return false;

  const userLevel =
    ROLE_HIERARCHY[userRole.toUpperCase() as keyof typeof ROLE_HIERARCHY] || 0;
  return userLevel >= requiredLevel;
};
