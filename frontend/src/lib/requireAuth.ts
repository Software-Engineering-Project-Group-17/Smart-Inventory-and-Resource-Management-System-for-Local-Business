import { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import admin from "./firebase-admin";
import { ROLES } from "./roles";

const sql = neon(process.env.DATABASE_URL!);

export interface AuthResult {
  isAuthenticated: boolean;
  user: {
    uid: string;
    email: string;
    userId: number;
    role: string;
    branchId?: number;
    staffId?: number;
    ownerId?: number;
  } | null;
  error?: string;
}

type UserRole = "OWNER" | "BRANCH_MANAGER" | "STAFF" | "CUSTOMER" | "SUPPLIER";

/**
 * Extracts Firebase token from request headers
 * Supports both Authorization header and localStorage token patterns
 */
function extractToken(request: NextRequest): string | null {
  // First try Authorization header (standard approach)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split("Bearer ")[1];
  }

  // Fallback: try custom header for localStorage token
  const tokenHeader = request.headers.get("x-auth-token");
  if (tokenHeader) {
    return tokenHeader;
  }

  return null;
}

/**
 * Verifies Firebase token and returns decoded token
 */
async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return { success: true, decodedToken };
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    return { success: false, error: "Invalid or expired token" };
  }
}

/**
 * Fetches user data and role from database using Firebase UID
 */
async function getUserFromDatabase(firebaseUid: string) {
  try {
    // First check in app_user table with roles
    const userResult = await sql`
      SELECT 
        u.user_id,
        u.email,
        u.firebase_uid,
        r.role as user_role
      FROM app_user u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.firebase_uid = ${firebaseUid} AND u.is_active = true
    `;

    if (userResult.length > 0) {
      const user = userResult[0];

      // Check if user is an OWNER
      const ownerResult = await sql`
        SELECT id, name 
        FROM owner 
        WHERE user_id = ${user.user_id}
      `;

      if (ownerResult.length > 0) {
        const branchResult = await sql`
          SELECT id FROM branches WHERE owner_id = ${user.user_id} LIMIT 1
        `;

        return {
          userId: user.user_id,
          email: user.email,
          role: ROLES.OWNER,
          branchId: branchResult.length > 0 ? branchResult[0].id : null,
          ownerId: ownerResult[0].id,
        };
      }

      // Check if user is STAFF (includes BRANCH_MANAGER)
      const staffResult = await sql`
        SELECT 
          s.id,
          s.branch_id,
          s.staff_types
        FROM staff s
        WHERE s.user_id = ${user.user_id} AND s.is_active = true
      `;

      if (staffResult.length > 0) {
        const staff = staffResult[0];

        // Check if this user is a branch manager by checking branches table
        const branchManagerResult = await sql`
          SELECT id FROM branches WHERE manager_id = ${user.user_id}
        `;

        const isBranchManager = branchManagerResult.length > 0;

        // Also check if the user's role in the roles table indicates they're a branch manager
        const hasManagerRole =
          user.user_role?.toUpperCase() === ROLES.BRANCH_MANAGER;

        return {
          userId: user.user_id,
          email: user.email,
          role:
            isBranchManager || hasManagerRole
              ? ROLES.BRANCH_MANAGER
              : ROLES.STAFF,
          branchId: staff.branch_id,
          staffId: staff.id,
        };
      }

      // Default role from roles table
      return {
        userId: user.user_id,
        email: user.email,
        role: user.user_role?.toUpperCase() || ROLES.STAFF,
        branchId: null,
      };
    }

    return null;
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Failed to fetch user data");
  }
}

/**
 * Main authentication function
 * Validates Firebase token and checks user roles against required permissions
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthResult> {
  try {
    // Extract token from request
    const token = extractToken(request);
    if (!token) {
      return {
        isAuthenticated: false,
        user: null,
        error: "No authentication token provided",
      };
    }

    // Verify Firebase token
    const { success, decodedToken, error } = await verifyFirebaseToken(token);
    if (!success || !decodedToken) {
      return {
        isAuthenticated: false,
        user: null,
        error: error || "Token verification failed",
      };
    }

    // Get user data from database
    const userData = await getUserFromDatabase(decodedToken.uid);
    if (!userData) {
      return {
        isAuthenticated: false,
        user: null,
        error: "User not found in database",
      };
    }

    // Check if user role is allowed
    const userRole = userData.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return {
        isAuthenticated: false,
        user: null,
        error: `Access denied. Required roles: ${allowedRoles.join(
          ", "
        )}. Your role: ${userRole}`,
      };
    }

    // Return successful authentication
    return {
      isAuthenticated: true,
      user: {
        uid: decodedToken.uid,
        email: userData.email,
        userId: userData.userId,
        role: userRole,
        branchId: userData.branchId,
        staffId: userData.staffId,
        ownerId: userData.ownerId,
      },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      isAuthenticated: false,
      user: null,
      error: "Authentication failed",
    };
  }
}

/**
 * Utility function to create standardized authentication responses
 */
export function createAuthResponse(
  authResult: AuthResult,
  statusCode: number = 401
) {
  if (!authResult.isAuthenticated) {
    return Response.json(
      {
        error: authResult.error || "Authentication failed",
        code: "AUTH_FAILED",
      },
      { status: statusCode }
    );
  }
  return null;
}
