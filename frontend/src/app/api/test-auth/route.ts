import { NextRequest, NextResponse } from "next/server";
import { requireAuth, createAuthResponse } from "@/lib/requireAuth";

/**
 * Test authentication endpoint
 * Demonstrates role-based access control
 */

// GET /api/test-auth - Test authentication with different role requirements
export async function GET(request: NextRequest) {
  // Require authentication - Only OWNER and BRANCH_MANAGER can access
  const authResult = await requireAuth(request, ["OWNER", "BRANCH_MANAGER"]);
  const authResponse = createAuthResponse(authResult);
  if (authResponse) return authResponse;

  return NextResponse.json({
    success: true,
    message: "Authentication successful!",
    user: {
      uid: authResult.user?.uid,
      email: authResult.user?.email,
      role: authResult.user?.role,
      branchId: authResult.user?.branchId,
      userId: authResult.user?.userId,
    },
    timestamp: new Date().toISOString(),
  });
}

// POST /api/test-auth - Test with staff-only access
export async function POST(request: NextRequest) {
  // Require authentication - Only STAFF can access this endpoint
  const authResult = await requireAuth(request, ["STAFF"]);
  const authResponse = createAuthResponse(authResult);
  if (authResponse) return authResponse;

  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    message: "Staff-only endpoint accessed successfully!",
    user: authResult.user,
    requestBody: body,
    timestamp: new Date().toISOString(),
  });
}

// PUT /api/test-auth - Test with owner-only access
export async function PUT(request: NextRequest) {
  // Require authentication - Only OWNER can access this endpoint
  const authResult = await requireAuth(request, ["OWNER"]);
  const authResponse = createAuthResponse(authResult);
  if (authResponse) return authResponse;

  return NextResponse.json({
    success: true,
    message: "Owner-only endpoint accessed successfully!",
    user: authResult.user,
    timestamp: new Date().toISOString(),
  });
}
