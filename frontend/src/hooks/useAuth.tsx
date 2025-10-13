"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isAuthenticated,
  getUserRole,
  hasAnyRole,
  getDefaultRedirectPath,
  getTokenTimeRemaining,
} from "@/lib/auth";
import { toastUtils } from "@/lib/toast-utils";

interface UseAuthOptions {
  requiredRoles?: string[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export const useAuth = (options: UseAuthOptions = {}) => {
  const {
    requiredRoles = [],
    redirectTo = "/login",
    requireAuth = true,
  } = options;

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      // Check if authentication is required
      if (requireAuth && !isAuthenticated()) {
        // Check if it was due to token expiration
        const timeRemaining = getTokenTimeRemaining();
        if (timeRemaining !== null && timeRemaining <= 0) {
          toastUtils.error(
            "Session Expired",
            "Your session has expired. Please log in again."
          );
        }
        router.push(redirectTo);
        return;
      }

      // Check role permissions if roles are specified
      if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        // Redirect to appropriate page based on user role
        const userRole = getUserRole();
        if (userRole) {
          router.push(getDefaultRedirectPath(userRole));
        } else {
          router.push("/login");
        }
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router, requiredRoles, redirectTo, requireAuth]);

  return { isLoading };
};

// Higher-order component for route protection
export const withAuth = (
  WrappedComponent: React.ComponentType<any>,
  options: UseAuthOptions = {}
) => {
  const ProtectedComponent = (props: any) => {
    const { isLoading } = useAuth(options);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  ProtectedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return ProtectedComponent;
};
