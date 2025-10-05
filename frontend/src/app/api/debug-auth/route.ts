import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import admin from "@/lib/firebase-admin";

const sql = neon(process.env.DATABASE_URL!);

// Debug endpoint to see what's happening with user role detection
export async function GET(request: NextRequest) {
  try {
    // Extract token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Debug: Get user data step by step
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

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "User not found", firebaseUid },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Check owner
    const ownerResult = await sql`
      SELECT id, name 
      FROM owner 
      WHERE user_id = ${user.user_id}
    `;

    // Check staff
    const staffResult = await sql`
      SELECT 
        s.id,
        s.branch_id,
        s.staff_types
      FROM staff s
      WHERE s.user_id = ${user.user_id} AND s.is_active = true
    `;

    // Check if user is branch manager
    const branchManagerResult = await sql`
      SELECT id, name FROM branches WHERE manager_id = ${user.user_id}
    `;

    // Check all branches for reference
    const allBranches = await sql`
      SELECT id, name, manager_id, owner_id FROM branches
    `;

    return NextResponse.json({
      debug: {
        firebaseUid,
        user: user,
        isOwner: ownerResult.length > 0,
        ownerData: ownerResult,
        isStaff: staffResult.length > 0,
        staffData: staffResult,
        isBranchManager: branchManagerResult.length > 0,
        branchManagerData: branchManagerResult,
        hasManagerRole: user.user_role?.toUpperCase() === "BRANCH_MANAGER",
        allBranches: allBranches,
        finalRole:
          branchManagerResult.length > 0
            ? "BRANCH_MANAGER"
            : user.user_role?.toUpperCase() === "BRANCH_MANAGER"
            ? "BRANCH_MANAGER"
            : staffResult.length > 0
            ? "STAFF"
            : ownerResult.length > 0
            ? "OWNER"
            : "UNKNOWN",
      },
    });
  } catch (error: any) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
