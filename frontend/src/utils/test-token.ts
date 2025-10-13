/**
 * Test token expiration functionality
 * This file can be used to manually test the token validation
 */

import {
  isAuthenticated,
  getTokenTimeRemaining,
  getTokenExpiration,
} from "../lib/auth";

// Test function to check current token status
export const testTokenStatus = () => {
  console.log("=== Token Status Test ===");

  const isAuth = isAuthenticated();
  console.log("Is Authenticated:", isAuth);

  const timeRemaining = getTokenTimeRemaining();
  console.log("Minutes Remaining:", timeRemaining);

  const expiration = getTokenExpiration();
  console.log("Token Expires At:", expiration?.toLocaleString());

  if (timeRemaining !== null && timeRemaining <= 5) {
    console.warn("⚠️ Token expires soon!");
  }

  console.log("========================");

  return {
    isAuthenticated: isAuth,
    minutesRemaining: timeRemaining,
    expirationDate: expiration,
  };
};

// Auto-run in browser console for testing
if (typeof window !== "undefined") {
  (window as any).testTokenStatus = testTokenStatus;
  console.log("Token testing function added to window.testTokenStatus()");
}
