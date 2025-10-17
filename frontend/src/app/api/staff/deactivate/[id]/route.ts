import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database/connection";
import { requireAuth } from "@/lib/requireAuth";
import { ROLES } from "@/lib/roles";

// PATCH /api/staff/deactivate/[id] - Deactivate a staff member (set is_active = false)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require BRANCH_MANAGER role for staff deactivation
  const authResult = await requireAuth(request, [
    ROLES.BRANCH_MANAGER,
    ROLES.OWNER,
  ]);
  if (!authResult.isAuthenticated || !authResult.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized - BRANCH_MANAGER role required",
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const staffId = parseInt(id);

    if (isNaN(staffId)) {
      return NextResponse.json(
        { success: false, message: "Invalid staff ID" },
        { status: 400 }
      );
    }

    const { user } = authResult;

    // First, check if this staff member belongs to the current manager's branch
    const staffCheck = await sql`
      SELECT s.id, s.user_id, s.manager_id, s.first_name, s.last_name, s.is_active,
             au.firebase_uid, au.email
      FROM staff s
      LEFT JOIN app_user au ON s.user_id = au.user_id
      WHERE s.id = ${staffId} AND s.manager_id = ${user.userId}
    `;

    if (staffCheck.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff member not found or you don't have permission to manage this staff member",
        },
        { status: 404 }
      );
    }

    const staffMember = staffCheck[0];

    // Check if staff member is already deactivated
    if (!staffMember.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: `${staffMember.first_name} ${staffMember.last_name} is already deactivated`,
        },
        { status: 400 }
      );
    }

    // Begin transaction to deactivate staff member and their app_user account
    // Step 1: Deactivate staff record
    await sql`
      UPDATE staff 
      SET is_active = false
      WHERE id = ${staffId}
    `;

    // Step 2: Deactivate app_user record to prevent login
    if (staffMember.user_id) {
      await sql`
        UPDATE app_user 
        SET is_active = false,
            account_status = 'DEACTIVATED',
            updated_at = now()
        WHERE user_id = ${staffMember.user_id}
      `;
    }

    // Log the deactivation action
    console.log(
      `Staff member deactivated - ID: ${staffId}, Name: ${staffMember.first_name} ${staffMember.last_name}, Email: ${staffMember.email}, Deactivated by: ${user.email}`
    );

    return NextResponse.json({
      success: true,
      message: `Staff member ${staffMember.first_name} ${staffMember.last_name} has been deactivated successfully`,
      data: {
        staffId: staffId,
        name: `${staffMember.first_name} ${staffMember.last_name}`,
        email: staffMember.email,
        deactivatedAt: new Date().toISOString(),
        deactivatedBy: user.email,
      },
    });
  } catch (error) {
    console.error("Error deactivating staff member:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while deactivating staff member",
      },
      { status: 500 }
    );
  }
}
