import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database/connection";
import { requireAuth, createAuthResponse } from "@/lib/requireAuth";
import { ROLES } from "@/lib/roles";

// GET /api/staff?email=user@example.com - Get staff details by email
export async function GET(request: NextRequest) {
  // Require authentication - Only OWNER and BRANCH_MANAGER can access staff details
  const authResult = await requireAuth(request, [
    ROLES.OWNER,
    ROLES.BRANCH_MANAGER,
  ]);

  if (!authResult.isAuthenticated) {
    return NextResponse.json(
      {
        success: false,
        error: authResult.error || "Authentication failed",
        code: "AUTH_FAILED",
      },
      { status: 401 }
    );
  }

  const user = authResult.user!;

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // For OWNER: can access all staff
    // For BRANCH_MANAGER: can only access staff from their branch
    let result;

    if (!email) {
      // Get all staff members (exclude BRANCH_MANAGERS who have manager_id = NULL)
      if (user.role === ROLES.OWNER) {
        result = await sql`
          SELECT s.id, s.first_name, s.last_name, s.email, s.tel, s.branch_id, s.address,
                 s.staff_types, s.hire_date, s.salary, s.manager_id,
                 CONCAT(s.first_name, ' ', s.last_name) as name,
                 b.name as branch_name, b.location as branch_location
          FROM staff s 
          LEFT JOIN branches b ON s.branch_id = b.id
          WHERE s.is_active = true AND s.manager_id IS NOT NULL
          ORDER BY s.first_name, s.last_name
        `;
      } else {
        // BRANCH_MANAGER can only see staff from their branch (exclude BRANCH_MANAGERS)
        result = await sql`
          SELECT s.id, s.first_name, s.last_name, s.email, s.tel, s.branch_id, s.address,
                 s.staff_types, s.hire_date, s.salary, s.manager_id,
                 CONCAT(s.first_name, ' ', s.last_name) as name,
                 b.name as branch_name, b.location as branch_location
          FROM staff s 
          LEFT JOIN branches b ON s.branch_id = b.id
          WHERE s.branch_id = ${user.branchId} AND s.is_active = true AND s.manager_id IS NOT NULL
          ORDER BY s.first_name, s.last_name
        `;
      }

      // Transform all staff data
      const staffList = result.map((staff: any) => ({
        id: staff.id,
        name: staff.name,
        first_name: staff.first_name,
        last_name: staff.last_name,
        firstName: staff.first_name,
        lastName: staff.last_name,
        email: staff.email,
        phone: staff.tel || "",
        tel: staff.tel,
        address: staff.address,
        branchId: staff.branch_id,
        branch_id: staff.branch_id,
        branchName: staff.branch_name,
        branch_name: staff.branch_name,
        branch_location: staff.branch_location,
        staff_types: staff.staff_types,
        hire_date: staff.hire_date,
        salary: staff.salary,
      }));

      return NextResponse.json({
        success: true,
        data: staffList,
      });
    } else {
      // Get specific staff member by email
      if (user.role === ROLES.OWNER) {
        result = await sql`
          SELECT s.id, s.first_name, s.last_name, s.email, s.tel, s.branch_id, s.address,
                 s.staff_types, s.hire_date, s.salary,
                 CONCAT(s.first_name, ' ', s.last_name) as name,
                 b.name as branch_name, b.location as branch_location
          FROM staff s 
          LEFT JOIN branches b ON s.branch_id = b.id
          WHERE s.email = ${email} AND s.is_active = true AND s.manager_id IS NOT NULL
        `;
      } else {
        // BRANCH_MANAGER can only see staff from their branch
        result = await sql`
          SELECT s.id, s.first_name, s.last_name, s.email, s.tel, s.branch_id, s.address,
                 s.staff_types, s.hire_date, s.salary,
                 CONCAT(s.first_name, ' ', s.last_name) as name,
                 b.name as branch_name, b.location as branch_location
          FROM staff s 
          LEFT JOIN branches b ON s.branch_id = b.id
          WHERE s.email = ${email} AND s.branch_id = ${user.branchId} AND s.is_active = true AND s.manager_id IS NOT NULL
        `;
      }

      if (result.length === 0) {
        return NextResponse.json(
          { success: false, error: "Staff member not found" },
          { status: 404 }
        );
      }

      const staff = result[0];

      // Transform the database response to match the frontend interface
      const staffData = {
        id: staff.id,
        name: staff.name,
        first_name: staff.first_name,
        last_name: staff.last_name,
        email: staff.email,
        phone: staff.tel || "", // Map tel to phone
        tel: staff.tel,
        address: staff.address,
        branchId: staff.branch_id,
        branch_id: staff.branch_id,
        branchName: staff.branch_name,
        branch_name: staff.branch_name,
        branch_location: staff.branch_location,
        staff_types: staff.staff_types,
        hire_date: staff.hire_date,
        salary: staff.salary,
      };

      return NextResponse.json({
        success: true,
        data: staffData,
      });
    }
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff details" },
      { status: 500 }
    );
  }
}
