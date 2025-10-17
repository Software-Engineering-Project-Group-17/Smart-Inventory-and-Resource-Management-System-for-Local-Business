import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database/connection";
import { requireAuth } from "@/lib/requireAuth";
import { ROLES } from "@/lib/roles";

// PATCH /api/branches/users/deactivate/[id] - Deactivate a branch user (BRANCH_MANAGER or STAFF)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require OWNER role for user deactivation
  const authResult = await requireAuth(request, [ROLES.OWNER]);
  if (!authResult.isAuthenticated || !authResult.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized - OWNER role required",
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const { user: owner } = authResult;

    // Get user details and verify they belong to a branch owned by this owner
    const userCheck = await sql`
      SELECT 
        au.user_id,
        au.email,
        au.name,
        au.is_active,
        au.account_status,
        r.role as role_name,
        CASE 
          WHEN r.role = 'BRANCH_MANAGER' THEN (
            SELECT b.id FROM branches b WHERE b.manager_id = au.user_id AND b.owner_id = ${owner.userId}
          )
          WHEN r.role = 'STAFF' THEN (
            SELECT s.branch_id FROM staff s 
            JOIN branches b ON s.branch_id = b.id 
            WHERE s.user_id = au.user_id AND b.owner_id = ${owner.userId}
          )
        END as branch_id,
        CASE 
          WHEN r.role = 'STAFF' THEN (
            SELECT s.id FROM staff s WHERE s.user_id = au.user_id
          )
        END as staff_id
      FROM app_user au
      JOIN roles r ON au.role_id = r.id
      WHERE au.user_id = ${userId}
        AND r.role IN ('BRANCH_MANAGER', 'STAFF')
    `;

    if (userCheck.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found or you don't have permission to manage this user",
        },
        { status: 404 }
      );
    }

    const userToDeactivate = userCheck[0];

    // Check if the user belongs to a branch owned by this owner
    if (!userToDeactivate.branch_id) {
      return NextResponse.json(
        {
          success: false,
          message: "User does not belong to any of your branches",
        },
        { status: 403 }
      );
    }

    // Check if user is already deactivated
    if (!userToDeactivate.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: `${
            userToDeactivate.name || userToDeactivate.email
          } is already deactivated`,
        },
        { status: 400 }
      );
    }

    // Begin deactivation process
    // Step 1: Deactivate app_user record
    await sql`
      UPDATE app_user 
      SET is_active = false,
          account_status = 'deactivated',
          updated_at = now()
      WHERE user_id = ${userId}
    `;

    // Step 2: If this is a staff member, also deactivate the staff record
    if (userToDeactivate.role_name === "STAFF" && userToDeactivate.staff_id) {
      await sql`
        UPDATE staff 
        SET is_active = false
        WHERE id = ${userToDeactivate.staff_id}
      `;
    }

    // Step 3: If this is a branch manager, we need to handle the branch
    // (You might want to implement logic to assign a new manager or mark branch as needing attention)
    if (userToDeactivate.role_name === "BRANCH_MANAGER") {
      // Optional: Log or notify that a branch manager was deactivated
      console.log(
        `Branch manager deactivated - User ID: ${userId}, Branch ID: ${userToDeactivate.branch_id}, Deactivated by Owner: ${owner.email}`
      );

      // You could add logic here to:
      // - Send notifications
      // - Mark branch as needing new manager
      // - Temporarily assign another manager
    }

    // Log the deactivation action
    console.log(
      `User deactivated - ID: ${userId}, Role: ${userToDeactivate.role_name}, Email: ${userToDeactivate.email}, Branch ID: ${userToDeactivate.branch_id}, Deactivated by: ${owner.email}`
    );

    return NextResponse.json({
      success: true,
      message: `${userToDeactivate.role_name.toLowerCase().replace("_", " ")} ${
        userToDeactivate.name || userToDeactivate.email
      } has been deactivated successfully`,
      data: {
        userId: userId,
        name: userToDeactivate.name,
        email: userToDeactivate.email,
        role: userToDeactivate.role_name,
        branchId: userToDeactivate.branch_id,
        staffId: userToDeactivate.staff_id,
        deactivatedAt: new Date().toISOString(),
        deactivatedBy: owner.email,
      },
    });
  } catch (error) {
    console.error("Error deactivating branch user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while deactivating user",
      },
      { status: 500 }
    );
  }
}
