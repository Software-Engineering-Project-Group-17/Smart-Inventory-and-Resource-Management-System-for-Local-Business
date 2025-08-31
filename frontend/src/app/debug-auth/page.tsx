"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const DebugAuth = () => {
  const [authData, setAuthData] = useState<any>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  useEffect(() => {
    // Check what's in localStorage
    const token = localStorage.getItem("token");
    const userProfile = localStorage.getItem("userProfile");
    const uid = localStorage.getItem("uid");

    const parsedProfile = userProfile ? JSON.parse(userProfile) : null;

    setAuthData({
      token: token,
      userProfile: parsedProfile,
      uid: uid,
      hasToken: !!token,
      hasProfile: !!(userProfile && parsedProfile && parsedProfile !== null),
    });

    // Also check Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(
        user
          ? {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              emailVerified: user.emailVerified,
            }
          : null
      );
    });

    return () => unsubscribe();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("uid");
    setAuthData({
      token: null,
      userProfile: null,
      uid: null,
      hasToken: false,
      hasProfile: false,
    });
  };

  if (!authData) return <div>Loading debug info...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug Info</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Firebase Auth Status</h2>
          {firebaseUser ? (
            <div className="bg-green-50 p-3 rounded">
              <div>
                <strong>✅ Firebase User Logged In</strong>
              </div>
              <div>
                <strong>UID:</strong> {firebaseUser.uid}
              </div>
              <div>
                <strong>Email:</strong> {firebaseUser.email}
              </div>
              <div>
                <strong>Display Name:</strong>{" "}
                {firebaseUser.displayName || "N/A"}
              </div>
              <div>
                <strong>Email Verified:</strong>{" "}
                {firebaseUser.emailVerified ? "Yes" : "No"}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 p-3 rounded text-red-700">
              ❌ No Firebase user logged in
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">LocalStorage Status</h2>
          <div className="space-y-2">
            <div
              className={`p-2 rounded ${
                authData.hasToken ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <strong>Token:</strong>{" "}
              {authData.hasToken ? "✅ Present" : "❌ Missing"}
            </div>
            <div
              className={`p-2 rounded ${
                authData.hasProfile ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <strong>User Profile:</strong>{" "}
              {authData.hasProfile ? "✅ Present" : "❌ Missing"}
            </div>
            <div
              className={`p-2 rounded ${
                authData.uid ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <strong>UID:</strong> {authData.uid ? "✅ Present" : "❌ Missing"}
            </div>
          </div>
        </div>
      </div>

      {authData.userProfile && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">User Profile Data</h2>
          <div className="bg-gray-50 p-3 rounded">
            <div>
              <strong>ID:</strong> {authData.userProfile.id || "N/A"}
            </div>
            <div>
              <strong>Email:</strong> {authData.userProfile.email || "N/A"}
            </div>
            <div>
              <strong>Username:</strong>{" "}
              {authData.userProfile.username || "N/A"}
            </div>
            <div>
              <strong>First Name:</strong>{" "}
              {authData.userProfile.firstName || "N/A"}
            </div>
            <div>
              <strong>Last Name:</strong>{" "}
              {authData.userProfile.lastName || "N/A"}
            </div>
            <div>
              <strong>Role:</strong> {authData.userProfile.role || "N/A"}
            </div>
            <div>
              <strong>Phone:</strong>{" "}
              {authData.userProfile.phoneNumber || "N/A"}
            </div>
            <div>
              <strong>Active:</strong>{" "}
              {authData.userProfile.isActive ? "Yes" : "No"}
            </div>
            <div>
              <strong>Created:</strong>{" "}
              {authData.userProfile.createdAt || "N/A"}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Raw Data</h2>
        <div className="bg-gray-100 p-4 rounded overflow-auto">
          <h3 className="font-semibold mb-2">LocalStorage:</h3>
          <pre className="text-xs mb-4">
            {JSON.stringify(authData, null, 2)}
          </pre>
          <h3 className="font-semibold mb-2">Firebase User:</h3>
          <pre className="text-xs">{JSON.stringify(firebaseUser, null, 2)}</pre>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Diagnosis</h3>
        <div className="text-blue-700 text-sm">
          {firebaseUser && !authData.hasProfile && (
            <div>
              🔍 <strong>Issue Found:</strong> You're logged into Firebase but
              missing backend user profile data. The backend login API call
              likely failed.
            </div>
          )}
          {!firebaseUser && (
            <div>
              ❌ <strong>Issue:</strong> Not logged into Firebase. Please log in
              first.
            </div>
          )}
          {firebaseUser && authData.hasProfile && authData.userProfile && (
            <div>
              ✅ <strong>All Good:</strong> Both Firebase auth and backend
              profile data are present!
            </div>
          )}
          {firebaseUser && authData.userProfile === null && (
            <div>
              ⚠️ <strong>Profile Issue:</strong> Firebase auth works but
              userProfile is null. Need to sync with backend.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={clearAuth}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Auth Data
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
        {firebaseUser && !authData.userProfile && (
          <button
            onClick={async () => {
              try {
                // Get fresh Firebase token
                const user = auth.currentUser;
                if (user) {
                  const token = await user.getIdToken();

                  // Call backend login API
                  const response = await fetch(
                    "http://localhost:8084/api/auth/login",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ email: firebaseUser.email }),
                    }
                  );

                  if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem(
                      "userProfile",
                      JSON.stringify(data.user)
                    );
                    alert(
                      "Account synced successfully! Please refresh the page."
                    );
                  } else {
                    const error = await response.text();
                    alert(`Sync failed: ${error}`);
                  }
                }
              } catch (error) {
                alert(`Error: ${error}`);
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Fix My Account
          </button>
        )}
      </div>
    </div>
  );
};

export default DebugAuth;
