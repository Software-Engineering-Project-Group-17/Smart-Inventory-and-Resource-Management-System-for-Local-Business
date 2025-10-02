import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database/connection";

// GET /api/staff?email=user@example.com - Get staff details by email
export async function GET(request: NextRequest) {
  try {
    // Authentication check - get user ID from headers
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email parameter is required" },
        { status: 400 }
      );
    }

    // First, get the requesting user's role and branch
    const userResult = await sql`
      SELECT 
        u.user_id,
        r.role as role_name,
        s.branch_id as user_branch_id
      FROM app_user u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN staff s ON u.user_id = s.user_id
      WHERE u.user_id = ${userId} AND u.is_active = true
    `;

    if (userResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found or inactive" },
        { status: 403 }
      );
    }

    const requestingUser = userResult[0] as any;

    // Authorization check - determine what staff data user can access
    let staffQuery;

    if (requestingUser.role_name === "OWNER") {
      // OWNER can see all staff across all branches
      staffQuery = sql`
        SELECT 
          s.id,
          s.first_name,
          s.last_name,
          s.email,
          s.tel,
          s.branch_id,
          b.name as branch_name
        FROM staff s
        LEFT JOIN branches b ON s.branch_id = b.id
        WHERE s.email = ${email} AND s.is_active = true
      `;
    } else if (requestingUser.role_name === "BRANCH_MANAGER") {
      // BRANCH_MANAGER can only see staff in their branch
      if (!requestingUser.user_branch_id) {
        return NextResponse.json(
          { success: false, message: "Manager branch not found" },
          { status: 403 }
        );
      }

      staffQuery = sql`
        SELECT 
          s.id,
          s.first_name,
          s.last_name,
          s.email,
          s.tel,
          s.branch_id,
          b.name as branch_name
        FROM staff s
        LEFT JOIN branches b ON s.branch_id = b.id
        WHERE s.email = ${email} 
          AND s.is_active = true 
          AND s.branch_id = ${requestingUser.user_branch_id}
      `;
    } else if (requestingUser.role_name === "STAFF") {
      // STAFF can only see their own details
      staffQuery = sql`
        SELECT 
          s.id,
          s.first_name,
          s.last_name,
          s.email,
          s.tel,
          s.branch_id,
          b.name as branch_name
        FROM staff s
        LEFT JOIN branches b ON s.branch_id = b.id
        WHERE s.email = ${email} 
          AND s.is_active = true 
          AND s.user_id = ${userId}
      `;
    } else {
      // Other roles (SUPPLIER, CUSTOMER) cannot access staff data
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient permissions to access staff data",
        },
        { status: 403 }
      );
    }

    const staffResult = await staffQuery;

    if (staffResult.length === 0) {
      // More specific error messages based on role
      const roleBasedMessage =
        requestingUser.role_name === "STAFF"
          ? "You can only access your own staff details"
          : requestingUser.role_name === "BRANCH_MANAGER"
          ? "Staff member not found in your branch"
          : "Staff member not found";

      return NextResponse.json(
        { success: false, message: roleBasedMessage },
        { status: 404 }
      );
    }

    const staff = staffResult[0] as any;

    // Log successful access for security monitoring
    console.log(
      `Staff data access: User ${userId} (${requestingUser.role_name}) accessed staff ${email}`
    );

    return NextResponse.json({
      success: true,
      data: {
        id: staff.id,
        name: `${staff.first_name} ${staff.last_name}`,
        email: staff.email,
        phone: staff.tel || "",
        branchId: staff.branch_id,
        branchName: staff.branch_name || "",
      },
    });
  } catch (error) {
    console.error("Failed to fetch staff:", error);

    // Log security-related errors
    if (error instanceof Error) {
      console.error(`Security error in /api/staff: ${error.message}`);
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { success: false, message: "Failed to fetch staff", error: errorMessage },
      { status: 500 }
    );
  }
}
