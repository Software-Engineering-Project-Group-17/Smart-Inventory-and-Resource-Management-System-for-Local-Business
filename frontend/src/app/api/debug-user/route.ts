import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database/connection";

export async function GET(request: NextRequest) {
  try {
    // Get user info from headers
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");
    const userRole = request.headers.get("x-user-role");

    console.log("Debug user lookup:", { userId, userEmail, userRole });

    let userResults: any[] = [];
    let staffResults: any[] = [];

    if (userId) {
      try {
        // Check if user exists in "user" table
        userResults = await sql`
          SELECT user_id, firebase_uid, email, name, role_id
          FROM "user" 
          WHERE firebase_uid = ${userId}
        `;

        // Check if user exists in staff table
        staffResults = await sql`
          SELECT 
            u.user_id,
            u.firebase_uid,
            u.email,
            s.id as staff_id,
            s.first_name,
            s.last_name,
            s.branch_id,
            b.name as branch_name
          FROM "user" u
          INNER JOIN staff s ON u.user_id = s.user_id
          LEFT JOIN branches b ON s.branch_id = b.id
          WHERE u.firebase_uid = ${userId}
        `;
      } catch (error) {
        console.error("Error querying by firebase_uid:", error);
      }
    }

    if (userEmail && userResults.length === 0) {
      try {
        // Check if user exists in "user" table by email
        userResults = await sql`
          SELECT user_id, firebase_uid, email, name, role_id
          FROM "user" 
          WHERE email = ${userEmail}
        `;

        // Check if user exists in staff table by email
        staffResults = await sql`
          SELECT 
            u.user_id,
            u.firebase_uid,
            u.email,
            s.id as staff_id,
            s.first_name,
            s.last_name,
            s.branch_id,
            b.name as branch_name
          FROM "user" u
          INNER JOIN staff s ON u.user_id = s.user_id
          LEFT JOIN branches b ON s.branch_id = b.id
          WHERE u.email = ${userEmail}
        `;
      } catch (error) {
        console.error("Error querying by email:", error);
      }
    }

    // Also get available branches
    const branches = await sql`
      SELECT id, name, location, status 
      FROM branches 
      ORDER BY name
    `;

    return NextResponse.json({
      success: true,
      debug: {
        receivedHeaders: { userId, userEmail, userRole },
        userInUserTable: userResults,
        userInStaffTable: staffResults,
        availableBranches: branches,
        recommendedAction:
          staffResults.length > 0
            ? `User found in staff table with branch_id: ${staffResults[0]?.branch_id}`
            : userResults.length > 0
            ? "User found in user table but not in staff table - needs to be added to staff"
            : "User not found in database - needs to be created",
      },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        error: "Failed to debug user lookup",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
