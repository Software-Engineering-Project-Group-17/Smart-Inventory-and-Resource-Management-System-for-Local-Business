import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database/connection";
import { requireAuth, createAuthResponse } from "@/lib/requireAuth";
import { ROLES } from "@/lib/roles";

// POST /api/resources/assignments - Assign a resource to staff
export async function POST(request: NextRequest) {
  // Require authentication - Only OWNER and BRANCH_MANAGER can assign resources
  const authResult = await requireAuth(request, [
    ROLES.OWNER,
    ROLES.BRANCH_MANAGER,
  ]);
  const authResponse = createAuthResponse(authResult);
  if (authResponse) return authResponse;

  try {
    const { user } = authResult;

    // User is guaranteed to exist after authentication
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User data not available" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      resourceId,
      staffEmail,
      purpose,
      startDate,
      endDate,
      startTime,
      endTime,
    } = body;

    // Validate required fields
    if (!resourceId || !staffEmail || !purpose || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "All assignment fields are required" },
        { status: 400 }
      );
    }

    // Find staff by email
    const staffResult = await sql`
      SELECT id, first_name, last_name, tel, branch_id 
      FROM staff 
      WHERE email = ${staffEmail} AND is_active = true
    `;

    if (staffResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "Staff member not found" },
        { status: 404 }
      );
    }

    const staff = staffResult[0] as any;

    // Check if resource exists and is available
    const resourceResult = await sql`
      SELECT id, name, availability_status, current_assignee_id 
      FROM resource 
      WHERE id = ${resourceId}
    `;

    if (resourceResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "Resource not found" },
        { status: 404 }
      );
    }

    const resource = resourceResult[0] as any;

    // Check if resource is already assigned
    const activeAssignment = await sql`
      SELECT id FROM staff_resource_assignment 
      WHERE resource_id = ${resourceId} AND is_active = true
    `;

    if (activeAssignment.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource is already assigned to another staff member",
        },
        { status: 400 }
      );
    }

    // Start transaction
    await sql`BEGIN`;

    try {
      // Create assignment
      const assignmentResult = await sql`
        INSERT INTO staff_resource_assignment 
        (staff_id, resource_id, purpose, start_date, end_date, start_time, end_time, is_active)
        VALUES (${staff.id}, ${resourceId}, ${purpose}, ${startDate}, ${endDate}, ${startTime}, ${endTime}, true)
        RETURNING *
      `;

      // Update resource status
      await sql`
        UPDATE resource 
        SET availability_status = 'used', 
            current_assignee_id = ${staff.id},
            assigned_at = NOW(),
            updated_at = NOW()
        WHERE id = ${resourceId}
      `;

      await sql`COMMIT`;

      const assignment = assignmentResult[0] as any;

      // Return assignment data in frontend format
      return NextResponse.json({
        success: true,
        message: "Resource assigned successfully",
        data: {
          id: assignment.id,
          resourceId: resourceId,
          resourceName: resource.name,
          email: staffEmail,
          staffName: `${staff.first_name} ${staff.last_name}`,
          phone: staff.tel || "",
          purpose: assignment.purpose,
          startDate: assignment.start_date,
          endDate: assignment.end_date,
          startTime: assignment.start_time,
          endTime: assignment.end_time,
        },
      });
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error("Failed to assign resource:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to assign resource",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/resources/assignments?id=123 - Unassign a resource
export async function DELETE(request: NextRequest) {
  // Require authentication - Only OWNER and BRANCH_MANAGER can unassign resources
  const authResult = await requireAuth(request, [
    ROLES.OWNER,
    ROLES.BRANCH_MANAGER,
  ]);
  const authResponse = createAuthResponse(authResult);
  if (authResponse) return authResponse;

  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("id");

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, message: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Get assignment details
    const assignmentResult = await sql`
      SELECT resource_id FROM staff_resource_assignment 
      WHERE id = ${assignmentId} AND is_active = true
    `;

    if (assignmentResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "Assignment not found" },
        { status: 404 }
      );
    }

    const assignment = assignmentResult[0] as any;

    // Start transaction
    await sql`BEGIN`;

    try {
      // Deactivate assignment
      await sql`
        UPDATE staff_resource_assignment 
        SET is_active = false, unassigned_at = NOW()
        WHERE id = ${assignmentId}
      `;

      // Update resource availability
      await sql`
        UPDATE resource 
        SET availability_status = 'available', 
            current_assignee_id = NULL,
            assigned_at = NULL,
            updated_at = NOW()
        WHERE id = ${assignment.resource_id}
      `;

      await sql`COMMIT`;

      return NextResponse.json({
        success: true,
        message: "Resource unassigned successfully",
      });
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error("Failed to unassign resource:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to unassign resource",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
