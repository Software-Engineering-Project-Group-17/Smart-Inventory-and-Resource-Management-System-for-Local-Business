import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth, createAuthResponse } from "@/lib/requireAuth";

const sql = neon(process.env.DATABASE_URL!);

// GET - Fetch user profile with branch information
export async function GET(request: NextRequest) {
  // Require authentication - All authenticated users can view their own profile
  const authResult = await requireAuth(request, [
    "OWNER",
    "BRANCH_MANAGER",
    "STAFF",
  ]);
  const authResponse = createAuthResponse(authResult);
  if (authResponse) return authResponse;

  try {
    const userId = authResult.user!.userId;

    console.log("Profile API GET - User ID from auth:", userId);

    // Get user details with branch information (if applicable)
    const result = await sql`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.created_at,
        u.is_active,
        u.last_login as last_login_at,
        r.role as role_name,
        b.name as branch_name,
        b.id as branch_id,
        s.address,
        s.tel as phone_number
      FROM app_user u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN staff s ON u.user_id = s.user_id
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE u.user_id = ${userId}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = result[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone_number,
        address: user.address,
        createdAt: user.created_at,
        isActive: user.is_active,
        lastLoginAt: user.last_login_at,
        role: user.role_name,
        branchName: user.branch_name,
        branchId: user.branch_id,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile (only editable fields)
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request, [
    "OWNER",
    "BRANCH_MANAGER",
    "STAFF",
  ]);
  const authResponse = createAuthResponse(authResult);
  if (authResponse) return authResponse;
  try {
    // Get user ID from headers (passed by client)
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phoneNumber, address } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Update user profile (only editable fields)
    // First update the name in app_user table
    const userResult = await sql`
      UPDATE app_user 
      SET 
        name = ${name},
        updated_at = now()
      WHERE user_id = ${userId}
      RETURNING user_id, name, email
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Then update address and phone in staff table (if user is staff)
    if (phoneNumber !== undefined || address !== undefined) {
      await sql`
        UPDATE staff 
        SET 
          tel = ${phoneNumber || null},
          address = ${address || null}
        WHERE user_id = ${userId}
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: userResult[0].user_id,
        name: userResult[0].name,
        email: userResult[0].email,
        phoneNumber: phoneNumber || null,
        address: address || null,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
