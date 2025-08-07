"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Input from "@/components/admin/Input";
import Image from "next/image";

export default function AdminRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      // TODO: Implement Google OAuth integration
      // This would typically involve:
      // 1. Initialize Google OAuth client
      // 2. Open Google sign-in popup
      // 3. Get user credentials
      // 4. Send to backend for verification
      // 5. Handle response

      toast({
        title: "Coming Soon",
        description: "Google sign-in will be available soon!",
        variant: "default",
      });

      console.log("Google sign-in initiated");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full relative">
      <div className="hidden lg:flex h-full w-1/2 bg-primaryColor items-center justify-center relative">
        {/* <Image src="/logo.png" fill alt="" className="object-cover" /> */}
      </div>
      <div className="flex flex-col items-center w-full h-full lg:w-1/2 py-12 px-4 sm:py-8 sm:px-6 md:py-12 md:px-8 lg:py-14 lg:px-5">
        <div className="size-full flex flex-col items-center p-2 sm:p-4 md:p-6 relative max-w-md w-full lg:max-w-none">
          {/* TOP PART */}
          <div className="h-auto lg:h-1/5 justify-center gap-3 sm:gap-5 items-center flex flex-col w-full mb-6 lg:mb-17">
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-3xl handwriting text-textLight text-center">
              Our Inventory
            </h1>
            <h2 className="heebo font-medium text-base sm:text-lg lg:text-lg text-textLight text-center px-4 lg:mb-4">
              Streamline your business operations
            </h2>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center w-full lg:h-3/5 lg:w-2/3 justify-center gap-4 sm:gap-6 relative"
          >
            <Input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
            <Input
              name="confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setconfirmPassword(e.target.value)}
              required
            />

            <button
              className="mt-4 sm:mt-6 px-8 sm:px-10 py-2 sm:py-2 bg-textLight text-white rounded-4xl text-center text-base sm:text-lg heebo font-semibold hover:bg-textDark transition-colors w-full sm:w-auto"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>

            {/* Divider */}
            <div className="flex items-center w-full my-3 sm:my-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-3 sm:px-4 text-xs sm:text-sm heebo font-light text-textLight">
                or
              </span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-4xl bg-white hover:bg-gray-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span className="heebo font-medium text-gray-700 group-hover:text-gray-900 text-sm sm:text-base">
                {isGoogleLoading ? "Connecting..." : "Continue with Google"}
              </span>
            </button>
          </form>

          {/* FOOTER */}
          <div className="h-auto lg:h-1/5 w-full items-center justify-center flex flex-col gap-2 sm:gap-3 mt-4 sm:mt-6 lg:mt-16">
            <p className="heebo font-light text-textLight text-sm sm:text-base text-center px-4">
              Have an account in{" "}
              <span className="handwriting text-textLight font-medium">
                Our Inventory
              </span>
              ?{" "}
              <a
                href="/login"
                className="text-textDark underline heebo font-medium hover:text-amber-600 transition-colors"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
