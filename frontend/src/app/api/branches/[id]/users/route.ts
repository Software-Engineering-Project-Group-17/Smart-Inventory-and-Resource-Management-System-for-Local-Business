import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database/connection";
import { requireAuth } from "@/lib/requireAuth";
import { ROLES } from "@/lib/roles";

// GET /api/branches/[id]/users - Get BRANCH_MANAGERS and STAFF for a specific branch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require OWNER role for branch user management
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

    const branchId = parseInt(id);

    if (isNaN(branchId)) {
      return NextResponse.json(
        { success: false, message: "Invalid branch ID" },
        { status: 400 }
      );
    }

    const { user } = authResult;

    // First, verify this branch belongs to the current owner
    const branchCheck = await sql`
      SELECT id, name, location
      FROM branches 
      WHERE id = ${branchId} AND owner_id = ${user.userId}
    `;

    if (branchCheck.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Branch not found or you don't have permission to manage this branch",
        },
        { status: 404 }
      );
    }

    const branch = branchCheck[0];

    // Get BRANCH_MANAGERS for this branch (current and previous)
    const branchManagers = await sql`
      SELECT 
        au.user_id,
        au.email,
        au.name,
        au.is_active,
        au.account_status,
        au.last_login,
        au.created_at,
        r.role as role_name,
        CASE 
          WHEN b.manager_id = au.user_id THEN 'CURRENT'
          WHEN s.manager_id IS NULL AND s.branch_id = ${branchId} THEN 'PREVIOUS'
        END as manager_status,
        b.name as branch_name,
        s.first_name,
        s.last_name,
        s.hire_date,
        s.salary
      FROM app_user au
      JOIN roles r ON au.role_id = r.id
      LEFT JOIN branches b ON b.manager_id = au.user_id AND b.id = ${branchId}
      LEFT JOIN staff s ON s.user_id = au.user_id AND s.branch_id = ${branchId} AND s.manager_id IS NULL
      WHERE r.role = 'BRANCH_MANAGER'
        AND (b.id = ${branchId} OR s.branch_id = ${branchId})
      ORDER BY 
        CASE WHEN b.manager_id = au.user_id THEN 0 ELSE 1 END,
        au.created_at DESC
    `;

    // Get STAFF members for this branch
    const staffMembers = await sql`
      SELECT 
        s.id as staff_id,
        au.user_id,
        au.email,
        au.name,
        au.is_active as user_active,
        au.account_status,
        au.last_login,
        au.created_at,
        s.first_name,
        s.last_name,
        s.is_active as staff_active,
        s.staff_types,
        s.salary,
        s.hire_date,
        r.role as role_name,
        b.name as branch_name
      FROM staff s
      JOIN app_user au ON s.user_id = au.user_id
      JOIN roles r ON au.role_id = r.id
      JOIN branches b ON s.branch_id = b.id
      WHERE s.branch_id = ${branchId}
        AND r.role = 'STAFF'
      ORDER BY s.hire_date DESC
    `;

    // Format the response
    const response = {
      success: true,
      data: {
        branch: {
          id: branch.id,
          name: branch.name,
          location: branch.location,
        },
        branchManagers: branchManagers.map((manager: any) => ({
          userId: manager.user_id,
          email: manager.email,
          name: manager.name,
          firstName: manager.first_name,
          lastName: manager.last_name,
          isActive: manager.is_active,
          accountStatus: manager.account_status,
          lastLogin: manager.last_login,
          createdAt: manager.created_at,
          role: manager.role_name,
          branchName: manager.branch_name,
          managerStatus: manager.manager_status,
          hireDate: manager.hire_date,
          salary: manager.salary,
        })),
        staff: staffMembers.map((staff: any) => ({
          staffId: staff.staff_id,
          userId: staff.user_id,
          email: staff.email,
          name: staff.name,
          firstName: staff.first_name,
          lastName: staff.last_name,
          isUserActive: staff.user_active,
          isStaffActive: staff.staff_active,
          accountStatus: staff.account_status,
          lastLogin: staff.last_login,
          createdAt: staff.created_at,
          staffTypes: staff.staff_types,
          salary: staff.salary,
          hireDate: staff.hire_date,
          role: staff.role_name,
          branchName: staff.branch_name,
        })),
        counts: {
          totalManagers: branchManagers.length,
          activeManagers: branchManagers.filter((m: any) => m.is_active).length,
          totalStaff: staffMembers.length,
          activeStaff: staffMembers.filter(
            (s: any) => s.user_active && s.staff_active
          ).length,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching branch users:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while fetching branch users",
      },
      { status: 500 }
    );
  }
}
