import { NextRequest, NextResponse } from "next/server";
import {
  sql,
  transformResource,
  transformAssignment,
  ResourceWithAssignment,
} from "@/lib/database/connection";

// GET /api/resources - Get resources for user's branch
export async function GET(request: NextRequest) {
  try {
    // Get user information from headers
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    if (!userId && !userEmail) {
      return NextResponse.json(
        { success: false, message: "User authentication required" },
        { status: 401 }
      );
    }

    // Get user's branch information from database
    let userInfo = null;

    try {
      if (userId) {
        // First try as Firebase UID
        let result = await sql`
          SELECT 
            u.user_id,
            u.email,
            u.firebase_uid,
            s.branch_id,
            s.id as staff_id
          FROM app_user u
          INNER JOIN staff s ON u.user_id = s.user_id
          WHERE u.firebase_uid = ${userId}
          LIMIT 1
        `;

        // If no result, try as user_id (for cases where frontend sends user_id instead of firebase_uid)
        if (result.length === 0) {
          result = await sql`
            SELECT 
              u.user_id,
              u.email,
              u.firebase_uid,
              s.branch_id,
              s.id as staff_id
            FROM app_user u
            INNER JOIN staff s ON u.user_id = s.user_id
            WHERE u.user_id = ${parseInt(userId)}
            LIMIT 1
          `;
        }

        userInfo = result[0];
      } else if (userEmail) {
        const result = await sql`
          SELECT 
            u.user_id,
            u.email,
            u.firebase_uid,
            s.branch_id,
            s.id as staff_id
          FROM app_user u
          INNER JOIN staff s ON u.user_id = s.user_id
          WHERE u.email = ${userEmail}
          LIMIT 1
        `;

        userInfo = result[0];
      }

      if (!userInfo || !userInfo.branch_id) {
        return NextResponse.json(
          {
            success: false,
            message:
              "User not found in database or not assigned to a branch. Please contact your administrator.",
          },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error("Failed to fetch user information:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to authenticate user",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Fetch resources for the user's specific branch only
    const resources = (await sql`
      SELECT * FROM resource_with_assignment_view 
      WHERE branch_id = ${userInfo.branch_id}
      ORDER BY created_at DESC
    `) as ResourceWithAssignment[];

    // Transform data for frontend
    const resourcesMap = new Map();
    const assignments: any[] = [];

    resources.forEach((dbResource) => {
      const resourceId = dbResource.id;

      // Add resource if not already added
      if (!resourcesMap.has(resourceId)) {
        resourcesMap.set(resourceId, transformResource(dbResource));
      }

      // Add assignment if exists
      const assignment = transformAssignment(dbResource);
      if (assignment) {
        assignments.push(assignment);
      }
    });

    const transformedResources = Array.from(resourcesMap.values());

    return NextResponse.json({
      success: true,
      data: {
        resources: transformedResources,
        assignments: assignments,
      },
    });
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch resources",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create a new resource
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, details, resourceType = "GENERAL" } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Resource name is required" },
        { status: 400 }
      );
    }

    // Get user information from headers
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");
    const userRole = request.headers.get("x-user-role"); // Add role to headers

    if (!userId && !userEmail) {
      return NextResponse.json(
        { success: false, message: "User authentication required" },
        { status: 401 }
      );
    }

    // Check if user has permission to create resources (STAFF or BRANCH_MANAGER)
    const allowedRoles = ["STAFF", "BRANCH_MANAGER", "ADMIN"];
    if (userRole && !allowedRoles.includes(userRole)) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient permissions to create resources",
        },
        { status: 403 }
      );
    }

    // Get user's branch information from database - user must exist since they're logged in
    let userInfo = null;

    try {
      if (userId) {
        // First try as Firebase UID
        let result = await sql`
          SELECT 
            u.user_id,
            u.email,
            u.firebase_uid,
            s.branch_id,
            s.id as staff_id
          FROM app_user u
          INNER JOIN staff s ON u.user_id = s.user_id
          WHERE u.firebase_uid = ${userId}
          LIMIT 1
        `;

        // If no result, try as user_id (for cases where frontend sends user_id instead of firebase_uid)
        if (result.length === 0) {
          result = await sql`
            SELECT 
              u.user_id,
              u.email,
              u.firebase_uid,
              s.branch_id,
              s.id as staff_id
            FROM app_user u
            INNER JOIN staff s ON u.user_id = s.user_id
            WHERE u.user_id = ${parseInt(userId)}
            LIMIT 1
          `;
        }

        userInfo = result[0];
      } else if (userEmail) {
        // Query by email using the actual schema structure
        const result = await sql`
          SELECT 
            u.user_id,
            u.email,
            u.firebase_uid,
            s.branch_id,
            s.id as staff_id
          FROM app_user u
          INNER JOIN staff s ON u.user_id = s.user_id
          WHERE u.email = ${userEmail}
          LIMIT 1
        `;
        userInfo = result[0];
      }

      if (!userInfo || !userInfo.branch_id) {
        return NextResponse.json(
          {
            success: false,
            message:
              "User not found in database or not assigned to a branch. Please contact your administrator.",
          },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      return NextResponse.json(
        { success: false, message: "Failed to authenticate user" },
        { status: 500 }
      );
    }

    // Generate resource number (you can customize this logic)
    const resourceNumber = `RES-${Date.now()}`;

    // Insert new resource with user's branch and creator info
    const result = await sql`
      INSERT INTO resource (name, resource_number, description, resource_type, branch_id, availability_status, created_by)
      VALUES (${name}, ${resourceNumber}, ${details}, ${resourceType}, ${userInfo.branch_id}, 'available', ${userInfo.user_id})
      RETURNING *
    `;

    const newResource = result[0] as any;

    return NextResponse.json({
      success: true,
      message: "Resource created successfully",
      data: transformResource({
        ...newResource,
        assignment_id: undefined,
        purpose: undefined,
        start_date: undefined,
        end_date: undefined,
        start_time: undefined,
        end_time: undefined,
        assigned_at: undefined,
        staff_id: undefined,
        first_name: undefined,
        last_name: undefined,
        staff_email: undefined,
        staff_phone: undefined,
        branch_name: undefined,
        branch_location: undefined,
      }),
    });
  } catch (error) {
    console.error("Failed to create resource:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create resource",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// PUT /api/resources - Update a resource
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, details, resourceType } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Resource ID is required" },
        { status: 400 }
      );
    }

    // Update resource
    const result = await sql`
      UPDATE resource 
      SET name = ${name}, description = ${details}, resource_type = ${resourceType}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resource updated successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Failed to update resource:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update resource",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/resources?id=123 - Delete a resource
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Resource ID is required" },
        { status: 400 }
      );
    }

    // First, check if resource has active assignments
    const activeAssignments = await sql`
      SELECT COUNT(*) as count 
      FROM staff_resource_assignment 
      WHERE resource_id = ${id} AND is_active = true
    `;

    if (parseInt(activeAssignments[0].count) > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete resource with active assignments",
        },
        { status: 400 }
      );
    }

    // Delete resource (cascade will handle assignments)
    const result = await sql`
      DELETE FROM resource 
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete resource:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete resource",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
