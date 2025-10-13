"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getDefaultRedirectPath, isAuthenticated } from "@/lib/auth";
import { toastUtils } from "@/lib/toast-utils";
import Input from "@/components/admin/Input";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { user, userRole } = useCurrentUser();

  // Initial check for expired tokens on component mount
  useEffect(() => {
    // Check if there's an expired token in localStorage
    const token = localStorage.getItem("token");
    const userProfile = localStorage.getItem("userProfile");

    if (token && userProfile && !isAuthenticated()) {
      // Token exists but is expired - clear it and show message
      toastUtils.info(
        "Session Expired",
        "Your previous session has expired. Please log in again."
      );
    }
  }, []);

  useEffect(() => {
    // Check if user has valid (non-expired) authentication
    if (user && isAuthenticated()) {
      router.push(getDefaultRedirectPath(userRole || ""));
    } else if (user && !isAuthenticated()) {
      // User exists but token is expired - show informative message
      toastUtils.info(
        "Session Expired",
        "Your previous session has expired. Please log in again."
      );
    }
  }, [user, userRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toastUtils.validationError(
        "Missing Information",
        "All fields are required."
      );
      return;
    }
    setIsLoading(true);

    try {
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();

      // Send token to backend
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      let userData = null;
      let userUid = userCredential.user.uid;

      if (response.ok) {
        // Backend call successful - check if user data exists
        const data = await response.json();

        if (data.user && data.user !== null) {
          // Backend has user data - use it
          userData = data.user;
          userUid = data.uid;
        } else {
          toastUtils.error("Login Failed", "No user profile returned.");
          return;
        }
      } else {
        toastUtils.error("Login Failed", "Unable to fetch user profile.");
        return;
      }

      // Store authentication data
      localStorage.setItem("token", token);
      localStorage.setItem("userProfile", JSON.stringify(userData));
      localStorage.setItem("uid", userUid);

      // Show success toast with role information
      const userName = userData?.firstName || email.split("@")[0];
      const userRole = userData?.role || "User";
      toastUtils.loginSuccess(userRole, userName);

      // Redirect based on user role
      if (userData && userData.role) {
        const redirectPath = getDefaultRedirectPath(userData.role);
        router.push(redirectPath);
      } else {
        // Fallback if no role is found
        router.push("/profile");
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle different types of authentication errors
      if (error instanceof Error) {
        if (error.message.includes("auth/")) {
          const errorCode =
            error.message.split("(")[1]?.split(")")[0] || "unknown";
          toastUtils.loginError(errorCode);
        } else {
          toastUtils.error("Login Failed", error.message);
        }
      } else {
        toastUtils.error(
          "Login Failed",
          "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full relative">
      <div className="hidden lg:flex h-full w-1/2 bg-gradient-to-b from-slate-200 to-[#3674B5] items-center justify-center relative">
        <Image src="/logo.png" fill alt="" className="object-contain" />
      </div>
      <div className="flex flex-col items-center w-full h-full lg:w-1/2 py-12 px-4 sm:py-8 sm:px-6 md:py-12 md:px-8 lg:py-14 lg:px-5">
        <div className="size-full flex flex-col items-center p-2 sm:p-4 md:p-6 relative max-w-md w-full lg:max-w-none">
          {/* TOP PART */}
          <div className="h-auto lg:h-1/5 justify-center gap-3 sm:gap-5 items-center flex flex-col w-full mb-6 lg:mb-17">
            <Image
              src="/logo.png"
              width={100}
              height={100}
              alt=""
              className="object-contain"
            />
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-3xl handwriting text-center">
              BUILDMATE
            </h1>
            <h2 className="heebo font-medium text-base sm:text-lg lg:text-lg text-center px-4">
              Streamline your business operations
            </h2>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center w-full lg:h-3/5 lg:w-2/3 justify-center gap-4 sm:gap-6 relative"
          >
            <Input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              className="mt-4 sm:mt-6 px-8 sm:px-10 py-2 bg-[#3674B5] hover:bg-blue-900 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-4xl text-base sm:text-lg heebo font-semibold transition-all duration-200 w-full sm:w-auto flex items-center justify-center gap-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
              )}
              {isLoading ? "Signing In..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
