"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface CustomerData {
  id?: number;
  customer_name: string;
  customer_email: string;
  customer_tel?: string;
  address?: string;
  loyalty_points?: number;
}

interface AuthContextType {
  user: User | null;
  customerData: CustomerData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshCustomerData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  customerData: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  refreshCustomerData: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.uid);
      setUser(user);
      if (user) {
        await fetchCustomerData(user);
      } else {
        setCustomerData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchCustomerData = async (user: User) => {
    try {
      console.log("Fetching customer data for user:", user.uid);
      const token = await user.getIdToken();
      console.log("Token obtained, making API call...");

      const response = await fetch("/api/customer/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Customer data found:", data);
        setCustomerData(data);
      } else if (response.status === 404) {
        console.log(
          "Customer not found, attempting to create/link customer..."
        );
        // Customer doesn't exist, try to create or link existing customer
        await createCustomer(user);
      } else {
        console.error(
          "Failed to fetch customer data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  const createCustomer = async (user: User) => {
    try {
      console.log("Creating customer for user:", user.uid);
      const token = await user.getIdToken();

      const response = await fetch("/api/customer/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: user.displayName || "Customer",
          customer_email: user.email || "",
          firebase_uid: user.uid,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Customer created/linked successfully:", data);
        setCustomerData(data);
      } else if (response.status === 409) {
        // Customer already exists with linked account
        console.log("Customer already exists with linked account");
        const errorData = await response.json();
        console.error("Customer linking conflict:", errorData.error);
        // Try to fetch existing customer data
        await fetchCustomerData(user);
      } else {
        const errorData = await response.json();
        console.error("Failed to create/link customer:", errorData);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log("Starting Google sign in...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google sign in successful:", result.user.uid);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCustomerData(null);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const refreshCustomerData = async () => {
    if (user) {
      await fetchCustomerData(user);
    }
  };

  const value = {
    user,
    customerData,
    loading,
    signInWithGoogle,
    logout,
    refreshCustomerData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
