import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Get user info from headers (you can add this when calling the API)
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "User identification required" },
        { status: 400 }
      );
    }

    // Query to get user's branch information
    // This assumes your database has a way to link users to branches
    // You might need to adjust this query based on your actual database schema
    let result;

    if (userId) {
      result = await sql`
        SELECT 
          u.user_id,
          u.email,
          u.name,
          s.first_name,
          s.last_name,
          s.branch_id,
          b.name as branch_name,
          b.location as branch_location,
          r.role as role_name
        FROM app_user u
        LEFT JOIN staff s ON u.user_id = s.user_id
        LEFT JOIN branches b ON s.branch_id = b.id
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.firebase_uid = ${userId}
        LIMIT 1
      `;
    } else {
      result = await sql`
        SELECT 
          u.user_id,
          u.email,
          u.name,
          s.first_name,
          s.last_name,
          s.branch_id,
          b.name as branch_name,
          b.location as branch_location,
          r.role as role_name
        FROM app_user u
        LEFT JOIN staff s ON u.user_id = s.user_id
        LEFT JOIN branches b ON s.branch_id = b.id
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = ${userEmail}
        LIMIT 1
      `;
    }

    if (result.length === 0) {
      return NextResponse.json(
        { error: "User not found or not assigned to a branch" },
        { status: 404 }
      );
    }

    const userBranchInfo = result[0];

    return NextResponse.json({
      userId: userBranchInfo.user_id,
      email: userBranchInfo.email,
      firstName: userBranchInfo.first_name,
      lastName: userBranchInfo.last_name,
      branchId: userBranchInfo.branch_id,
      branchName: userBranchInfo.branch_name,
      branchLocation: userBranchInfo.branch_location,
      role: userBranchInfo.role_name,
    });
  } catch (error) {
    console.error("Error fetching user branch info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user branch information" },
      { status: 500 }
    );
  }
}
