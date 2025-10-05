"use client";

import { useState } from "react";
import { authenticatedFetch, handleAuthError } from "@/lib/authenticated-fetch";

/**
 * Component to test role-based authentication
 * This demonstrates how to use the new authentication system
 */
export default function AuthTestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, data: any) => {
    setResults((prev) => [
      ...prev,
      {
        test,
        success,
        data,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const testEndpoint = async (
    method: string,
    endpoint: string,
    expectedRoles: string[]
  ) => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(endpoint, { method });
      const data = await response.json();

      if (response.ok) {
        addResult(`${method} ${endpoint}`, true, {
          message: data.message || "Success",
          userRole: data.user?.role || data.debug?.finalRole || "Unknown",
          expectedRoles,
          fullResponse: data, // Include full response for debug endpoints
          ...data,
        });
      } else {
        addResult(`${method} ${endpoint}`, false, {
          error: data.error,
          expectedRoles,
          userRole: "Unknown",
          fullResponse: data,
        });
      }
    } catch (error: any) {
      addResult(`${method} ${endpoint}`, false, {
        error: error.message,
        expectedRoles,
      });
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => setResults([]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Dashboard</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">How to Test:</h2>
        {/* <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Make sure you&apos;re logged in with a Firebase account</li>
          <li>
            Your user must exist in the database with a role (OWNER,
            BRANCH_MANAGER, or STAFF)
          </li>
          <li>Click the test buttons below to verify role-based access</li>
          <li>
            Green results = Success, Red results = Access denied (as expected)
          </li>
        </ol> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() =>
            testEndpoint("GET", "/api/test-auth", ["OWNER", "BRANCH_MANAGER"])
          }
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Manager Access (GET)
        </button>

        <button
          onClick={() => testEndpoint("POST", "/api/test-auth", ["STAFF"])}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Staff Access (POST)
        </button>

        <button
          onClick={() => testEndpoint("PUT", "/api/test-auth", ["OWNER"])}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Owner Access (PUT)
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            testEndpoint("GET", "/api/categories", [
              "OWNER",
              "BRANCH_MANAGER",
              "STAFF",
            ]);
          }}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Categories API
        </button>

        {/* <button
          onClick={() => {
            testEndpoint("GET", "/api/debug-auth", []);
          }}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          🐛 Debug User Role
        </button> */}

        <button
          onClick={clearResults}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Clear Results
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">Testing...</span>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Results:</h2>
        {results.length === 0 ? (
          <p className="text-gray-500">
            No tests run yet. Click a test button above.
          </p>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                result.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">
                  {result.success ? "✅" : "❌"} {result.test}
                </h3>
                <span className="text-xs text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="text-sm space-y-1">
                <p>
                  <strong>Expected Roles:</strong>{" "}
                  {result.data.expectedRoles?.join(", ") || "N/A"}
                </p>
                {result.success ? (
                  <>
                    <p>
                      <strong>Your Role:</strong> {result.data.userRole}
                    </p>
                    <p>
                      <strong>Message:</strong> {result.data.message}
                    </p>
                    {result.data.user && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600">
                          User Details
                        </summary>
                        <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto">
                          {JSON.stringify(result.data.user, null, 2)}
                        </pre>
                      </details>
                    )}
                    {result.data.debug && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-purple-600">
                          🐛 Debug Data
                        </summary>
                        <pre className="mt-1 text-xs bg-purple-50 p-2 rounded border overflow-auto">
                          {JSON.stringify(result.data.debug, null, 2)}
                        </pre>
                      </details>
                    )}
                    {result.data.fullResponse &&
                      !result.data.user &&
                      !result.data.debug && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-gray-600">
                            Full Response
                          </summary>
                          <pre className="mt-1 text-xs bg-gray-50 p-2 rounded border overflow-auto">
                            {JSON.stringify(result.data.fullResponse, null, 2)}
                          </pre>
                        </details>
                      )}
                  </>
                ) : (
                  <p>
                    <strong>Error:</strong> {result.data.error}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Implementation Details:</h3>
        <ul className="text-sm space-y-1">
          <li>
            • Authentication tokens are stored in localStorage after login
          </li>
          {/* <li>
            • API routes use{" "}
            <code>
              requireAuth(request, [&quot;ROLE1&quot;, &quot;ROLE2&quot;])
            </code>
          </li> */}
          <li>• Firebase tokens are verified server-side</li>
          <li>• User roles are fetched from your database</li>
          <li>• Frontend automatically includes Authorization headers</li>
        </ul>
      </div>
    </div>
  );
}
