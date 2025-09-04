"use client";

import { useState, useEffect } from "react";
import {
  getUserProfile,
  getUserRole,
  isAuthenticated,
  UserProfile,
} from "@/lib/auth";

export const useCurrentUser = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      try {
        const authenticated = isAuthenticated();
        const profile = getUserProfile();

        console.log("useCurrentUser - Authentication check:", {
          authenticated,
          profile,
          hasToken: !!localStorage.getItem("token"),
          hasProfile: !!localStorage.getItem("userProfile"),
          rawUserProfile: localStorage.getItem("userProfile"),
        });

        setIsLoggedIn(authenticated);
        setUserProfile(profile);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in useCurrentUser:", error);
        setIsLoggedIn(false);
        setUserProfile(null);
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkUser();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const getUserName = () => {
    if (!userProfile) return null;

    // Try different name formats
    if (userProfile.firstName && userProfile.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    if (userProfile.username) {
      return userProfile.username;
    }
    if (userProfile.email) {
      return userProfile.email.split("@")[0];
    }
    return "User";
  };

  return {
    user: userProfile,
    isLoading,
    isLoggedIn,
    userRole: userProfile?.role || null,
    userEmail: userProfile?.email || null,
    userName: getUserName(),
    // Utility functions
    refreshUser: () => {
      const profile = getUserProfile();
      setUserProfile(profile);
      setIsLoggedIn(isAuthenticated());
    },
  };
};
