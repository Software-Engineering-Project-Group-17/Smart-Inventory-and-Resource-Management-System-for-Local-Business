"use client";

import React, { useState } from "react";

const QuickFixAuth = () => {
  const [result, setResult] = useState("");

  const fixAuth = async () => {
    try {
      setResult("Checking localStorage...");

      const token = localStorage.getItem("token");
      const userProfile = localStorage.getItem("userProfile");
      const uid = localStorage.getItem("uid");

      setResult(`
Found:
- Token: ${token ? "Present" : "Missing"}
- UserProfile: ${userProfile || "NULL/Missing"}
- UID: ${uid || "Missing"}

${
  userProfile === "null"
    ? '⚠️ UserProfile is "null" string - this is the problem!'
    : ""
}
      `);

      if (
        userProfile === "null" ||
        !userProfile ||
        userProfile === "undefined"
      ) {
        setResult((prev) => prev + "\n\n🔧 Fixing userProfile...");

        // Create a more accurate user profile
        const properProfile = {
          id: uid || "fVpdCkB29vc6crFM3FhhY0fUCOu2",
          email: "thivinu4@mail.com",
          username: "thivinu4",
          firstName: "Thivinu",
          lastName: "Dil",
          role: "OWNER", // You can verify this in your database
          phoneNumber: "",
          address: "",
          department: "Management",
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          profilePictureUrl: "",
          subscriptionStatus: "active",
          subscriptionExpiresAt: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1 year from now
        };

        localStorage.setItem("userProfile", JSON.stringify(properProfile));
        setResult((prev) => prev + "\n✅ Fixed! Refresh the profile page.");
      }
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Quick Fix Authentication</h1>

      <button
        onClick={fixAuth}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Check & Fix LocalStorage
      </button>

      {result && (
        <pre className="mt-4 p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
};

export default QuickFixAuth;
