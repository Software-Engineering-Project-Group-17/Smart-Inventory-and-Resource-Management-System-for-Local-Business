"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const FixAuthPage = () => {
  const [email, setEmail] = useState("thivinu4@mail.com");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setMessage("Please enter your password");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Re-authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get fresh token
      const token = await user.getIdToken(true); // force refresh

      setMessage("Got fresh Firebase token, calling backend...");

      // Call backend login API with fresh token
      const response = await fetch("http://localhost:8084/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Backend login failed");
      }

      const data = await response.json();

      // Store authentication data
      localStorage.setItem("token", token);
      localStorage.setItem("userProfile", JSON.stringify(data.user));
      localStorage.setItem("uid", data.uid);

      setMessage("✅ Authentication fixed successfully!");

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (error) {
      console.error("Reauth error:", error);
      setMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Fix Authentication</h1>
      <p className="text-gray-600 mb-6">
        Re-authenticate to sync your account with the backend database.
      </p>

      <form onSubmit={handleReauth} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? "Fixing..." : "Fix Authentication"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded ${
            message.includes("✅")
              ? "bg-green-50 text-green-800"
              : message.includes("❌")
              ? "bg-red-50 text-red-800"
              : "bg-blue-50 text-blue-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <p>
          <strong>Why is this needed?</strong>
        </p>
        <p>
          Your Firebase authentication is working, but the backend user profile
          data is missing. This will refresh your token and sync your account
          properly.
        </p>
      </div>
    </div>
  );
};

export default FixAuthPage;
