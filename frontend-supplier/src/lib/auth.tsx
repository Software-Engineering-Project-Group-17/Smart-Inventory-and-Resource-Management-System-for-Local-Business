"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface Supplier {
  id: number;
  user_id: number;
  supplier_name: string;
  supplier_email: string;
  supplier_tel?: string;
  address?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  supplier: Supplier | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    supplierData: Omit<Supplier, "id" | "user_id" | "created_at">
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshSupplier: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Set auth token in cookie for middleware
        const token = await firebaseUser.getIdToken();
        document.cookie = `auth-token=${token}; path=/; max-age=${
          60 * 60 * 24 * 7
        }`; // 7 days

        // Fetch supplier data from our API with retry mechanism
        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 1000; // 1 second

        const fetchSupplierData = async (): Promise<void> => {
          try {
            const response = await fetch("/api/auth/me", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              setSupplier(data.supplier);
            } else if (response.status === 404 && retryCount < maxRetries) {
              // User not found, might be a timing issue - retry after delay
              console.log(`Supplier data not found, retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
              retryCount++;
              setTimeout(fetchSupplierData, retryDelay);
              return;
            } else {
              console.error("Failed to fetch supplier data");
              setSupplier(null);
            }
          } catch (error) {
            if (retryCount < maxRetries) {
              console.log(`Error fetching supplier data, retrying... (attempt ${retryCount + 1}/${maxRetries})`);
              retryCount++;
              setTimeout(fetchSupplierData, retryDelay);
              return;
            }
            console.error("Error fetching supplier data:", error);
            setSupplier(null);
          }
        };

        await fetchSupplierData();
      } else {
        // Remove auth token cookie
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setSupplier(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    supplierData: Omit<Supplier, "id" | "user_id" | "created_at">
  ) => {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      // Create user and supplier in our database
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: supplierData.supplier_name,
          supplier_data: supplierData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create supplier account");
      }

      const data = await response.json();
      setSupplier(data.supplier);
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const refreshSupplier = async () => {
    if (user) {
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSupplier(data.supplier);
        }
      } catch (error) {
        console.error("Error refreshing supplier data:", error);
      }
    }
  };

  const value = {
    user,
    supplier,
    loading,
    signIn,
    signUp,
    logout,
    refreshSupplier,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
