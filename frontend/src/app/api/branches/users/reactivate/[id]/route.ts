import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database/connection";
import { requireAuth } from "@/lib/requireAuth";
import { ROLES } from "@/lib/roles";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate and verify OWNER role
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

    const { user: owner } = authResult;
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    console.log(`🔄 OWNER ${owner.email} reactivating user ID: ${userId}`);

    // 2. Get user details and verify they belong to owner's branches
    const userResult = await sql`
      SELECT 
        au.user_id,
        au.name,
        au.email,
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

    if (userResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found or not associated with your branches",
        },
        { status: 404 }
      );
    }

    const targetUser = userResult[0];

    // Check if the user belongs to a branch owned by this owner
    if (!targetUser.branch_id) {
      return NextResponse.json(
        {
          success: false,
          message: "User does not belong to any of your branches",
        },
        { status: 403 }
      );
    }

    // 3. Check if user is already active
    if (targetUser.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: `${targetUser.role_name} ${
            targetUser.name || targetUser.email
          } is already active`,
        },
        { status: 400 }
      );
    }

    // 4. Reactivate the user in app_user table
    await sql`
      UPDATE app_user 
      SET 
        is_active = true,
        account_status = 'ACTIVE',
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `;

    // 5. If it's a STAFF member, also reactivate their staff record
    if (targetUser.role_name === "STAFF" && targetUser.staff_id) {
      await sql`
        UPDATE staff 
        SET 
          is_active = true
        WHERE id = ${targetUser.staff_id}
      `;
    }

    console.log(
      `✅ ${targetUser.role_name} ${
        targetUser.name || targetUser.email
      } reactivated successfully`
    );

    return NextResponse.json({
      success: true,
      message: `${targetUser.role_name} reactivated successfully`,
      data: {
        userId: targetUser.user_id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role_name,
        branchId: targetUser.branch_id,
        staffId: targetUser.staff_id,
        reactivatedAt: new Date().toISOString(),
        reactivatedBy: owner.email,
      },
    });
  } catch (error) {
    console.error("❌ Error reactivating user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while reactivating user",
      },
      { status: 500 }
    );
  }
}
