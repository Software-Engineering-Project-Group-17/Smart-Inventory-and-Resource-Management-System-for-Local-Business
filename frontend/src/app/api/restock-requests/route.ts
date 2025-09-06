import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Get user info from headers
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Get user and their branch (following the same pattern as inventory API)
    let userResult: any[] = [];

    if (userId) {
      // First try as Firebase UID
      userResult = await sql`
        SELECT 
          u.user_id,
          u.email,
          u.firebase_uid,
          s.branch_id,
          s.id as staff_id,
          b.name as branch_name,
          b.location as branch_location
        FROM app_user u
        INNER JOIN staff s ON u.user_id = s.user_id
        INNER JOIN branches b ON s.branch_id = b.id
        WHERE u.firebase_uid = ${userId}
        LIMIT 1
      `;

      // If no result, try as user_id
      if (userResult.length === 0) {
        userResult = await sql`
          SELECT 
            u.user_id,
            u.email,
            u.firebase_uid,
            s.branch_id,
            s.id as staff_id,
            b.name as branch_name,
            b.location as branch_location
          FROM app_user u
          INNER JOIN staff s ON u.user_id = s.user_id
          INNER JOIN branches b ON s.branch_id = b.id
          WHERE u.user_id = ${parseInt(userId)}
          LIMIT 1
        `;
      }
    }

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "User not found or not authorized" },
        { status: 403 }
      );
    }

    const user = userResult[0];
    const branchId = user.branch_id;

    // Get restock requests with aggregated data
    let requestsResult: any[] = [];
    let countResult: any[] = [];

    if (status && priority && search) {
      requestsResult = await sql`
        SELECT 
          rr.id, rr.title, rr.description, rr.priority, rr.status,
          rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes,
          rr.branch_id, rr.created_by, u.name as created_by_name, b.name as branch_name,
          COUNT(rri.id) as item_count, COALESCE(SUM(rri.requested_quantity), 0) as total_quantity_requested
        FROM restock_request rr
        LEFT JOIN app_user u ON rr.created_by = u.user_id
        LEFT JOIN branches b ON rr.branch_id = b.id
        LEFT JOIN restock_request_item rri ON rr.id = rri.restock_request_id
        WHERE rr.branch_id = ${branchId} AND rr.status = ${status} AND rr.priority = ${priority} 
          AND (rr.title ILIKE ${`%${search}%`} OR rr.description ILIKE ${`%${search}%`})
        GROUP BY rr.id, rr.title, rr.description, rr.priority, rr.status, 
                 rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes, 
                 rr.branch_id, rr.created_by, u.name, b.name
        ORDER BY rr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(DISTINCT rr.id) as total
        FROM restock_request rr
        WHERE rr.branch_id = ${branchId} AND rr.status = ${status} AND rr.priority = ${priority} 
          AND (rr.title ILIKE ${`%${search}%`} OR rr.description ILIKE ${`%${search}%`})
      `;
    } else if (status && priority) {
      requestsResult = await sql`
        SELECT 
          rr.id, rr.title, rr.description, rr.priority, rr.status,
          rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes,
          rr.branch_id, rr.created_by, u.name as created_by_name, b.name as branch_name,
          COUNT(rri.id) as item_count, COALESCE(SUM(rri.requested_quantity), 0) as total_quantity_requested
        FROM restock_request rr
        LEFT JOIN app_user u ON rr.created_by = u.user_id
        LEFT JOIN branches b ON rr.branch_id = b.id
        LEFT JOIN restock_request_item rri ON rr.id = rri.restock_request_id
        WHERE rr.branch_id = ${branchId} AND rr.status = ${status} AND rr.priority = ${priority}
        GROUP BY rr.id, rr.title, rr.description, rr.priority, rr.status, 
                 rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes, 
                 rr.branch_id, rr.created_by, u.name, b.name
        ORDER BY rr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(DISTINCT rr.id) as total
        FROM restock_request rr
        WHERE rr.branch_id = ${branchId} AND rr.status = ${status} AND rr.priority = ${priority}
      `;
    } else if (status && search) {
      requestsResult = await sql`
        SELECT 
          rr.id, rr.title, rr.description, rr.priority, rr.status,
          rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes,
          rr.branch_id, rr.created_by, u.name as created_by_name, b.name as branch_name,
          COUNT(rri.id) as item_count, COALESCE(SUM(rri.requested_quantity), 0) as total_quantity_requested
        FROM restock_request rr
        LEFT JOIN app_user u ON rr.created_by = u.user_id
        LEFT JOIN branches b ON rr.branch_id = b.id
        LEFT JOIN restock_request_item rri ON rr.id = rri.restock_request_id
        WHERE rr.branch_id = ${branchId} AND rr.status = ${status} 
          AND (rr.title ILIKE ${`%${search}%`} OR rr.description ILIKE ${`%${search}%`})
        GROUP BY rr.id, rr.title, rr.description, rr.priority, rr.status, 
                 rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes, 
                 rr.branch_id, rr.created_by, u.name, b.name
        ORDER BY rr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(DISTINCT rr.id) as total
        FROM restock_request rr
        WHERE rr.branch_id = ${branchId} AND rr.status = ${status} 
          AND (rr.title ILIKE ${`%${search}%`} OR rr.description ILIKE ${`%${search}%`})
      `;
    } else if (priority && search) {
      requestsResult = await sql`
        SELECT 
          rr.id, rr.title, rr.description, rr.priority, rr.status,
          rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes,
          rr.branch_id, rr.created_by, u.name as created_by_name, b.name as branch_name,
          COUNT(rri.id) as item_count, COALESCE(SUM(rri.requested_quantity), 0) as total_quantity_requested
        FROM restock_request rr
        LEFT JOIN app_user u ON rr.created_by = u.user_id
        LEFT JOIN branches b ON rr.branch_id = b.id
        LEFT JOIN restock_request_item rri ON rr.id = rri.restock_request_id
        WHERE rr.branch_id = ${branchId} AND rr.priority = ${priority} 
          AND (rr.title ILIKE ${`%${search}%`} OR rr.description ILIKE ${`%${search}%`})
        GROUP BY rr.id, rr.title, rr.description, rr.priority, rr.status, 
                 rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes, 
                 rr.branch_id, rr.created_by, u.name, b.name
        ORDER BY rr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(DISTINCT rr.id) as total
        FROM restock_request rr
        WHERE rr.branch_id = ${branchId} AND rr.priority = ${priority} 
          AND (rr.title ILIKE ${`%${search}%`} OR rr.description ILIKE ${`%${search}%`})
      `;
    } else if (status) {
      requestsResult = await sql`
        SELECT 
          rr.id, rr.title, rr.description, rr.priority, rr.status,
          rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes,
          rr.branch_id, rr.created_by, u.name as created_by_name, b.name as branch_name,
          COUNT(rri.id) as item_count, COALESCE(SUM(rri.requested_quantity), 0) as total_quantity_requested
        FROM restock_request rr
        LEFT JOIN app_user u ON rr.created_by = u.user_id
        LEFT JOIN branches b ON rr.branch_id = b.id
        LEFT JOIN restock_request_item rri ON rr.id = rri.restock_request_id
        WHERE rr.branch_id = ${branchId} AND rr.status = ${status}
        GROUP BY rr.id, rr.title, rr.description, rr.priority, rr.status,  
                 rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes, 
                 rr.branch_id, rr.created_by, u.name, b.name
        ORDER BY rr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(DISTINCT rr.id) as total
        FROM restock_request rr
        WHERE rr.branch_id = ${branchId} AND rr.status = ${status}
      `;
    } else if (priority) {
      requestsResult = await sql`
        SELECT 
          rr.id, rr.title, rr.description, rr.priority, rr.status, 
          rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes,
          rr.branch_id, rr.created_by, u.name as created_by_name, b.name as branch_name,
          COUNT(rri.id) as item_count, COALESCE(SUM(rri.requested_quantity), 0) as total_quantity_requested
        FROM restock_request rr
        LEFT JOIN app_user u ON rr.created_by = u.user_id
        LEFT JOIN branches b ON rr.branch_id = b.id
        LEFT JOIN restock_request_item rri ON rr.id = rri.restock_request_id
        WHERE rr.branch_id = ${branchId} AND rr.priority = ${priority}
        GROUP BY rr.id, rr.title, rr.description, rr.priority, rr.status,  
                 rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes, 
                 rr.branch_id, rr.created_by, u.name, b.name
        ORDER BY rr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(DISTINCT rr.id) as total
        FROM restock_request rr
        WHERE rr.branch_id = ${branchId} AND rr.priority = ${priority}
      `;
    } else if (search) {
      requestsResult = await sql`
        SELECT 
          rr.id, rr.title, rr.description, rr.priority, rr.status, 
          rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes,
          rr.branch_id, rr.created_by, u.name as created_by_name, b.name as branch_name,
          COUNT(rri.id) as item_count, COALESCE(SUM(rri.requested_quantity), 0) as total_quantity_requested
        FROM restock_request rr
        LEFT JOIN app_user u ON rr.created_by = u.user_id
        LEFT JOIN branches b ON rr.branch_id = b.id
        LEFT JOIN restock_request_item rri ON rr.id = rri.restock_request_id
        WHERE rr.branch_id = ${branchId} AND (rr.title ILIKE ${`%${search}%`} OR rr.description ILIKE ${`%${search}%`})
        GROUP BY rr.id, rr.title, rr.description, rr.priority, rr.status,  
                 rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes, 
                 rr.branch_id, rr.created_by, u.name, b.name
        ORDER BY rr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(DISTINCT rr.id) as total
        FROM restock_request rr
        WHERE rr.branch_id = ${branchId} AND (rr.title ILIKE ${`%${search}%`} OR rr.description ILIKE ${`%${search}%`})
      `;
    } else {
      requestsResult = await sql`
        SELECT 
          rr.id, rr.title, rr.description, rr.priority, rr.status, 
          rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes,
          rr.branch_id, rr.created_by, u.name as created_by_name, b.name as branch_name,
          COUNT(rri.id) as item_count, COALESCE(SUM(rri.requested_quantity), 0) as total_quantity_requested
        FROM restock_request rr
        LEFT JOIN app_user u ON rr.created_by = u.user_id
        LEFT JOIN branches b ON rr.branch_id = b.id
        LEFT JOIN restock_request_item rri ON rr.id = rri.restock_request_id
        WHERE rr.branch_id = ${branchId}
        GROUP BY rr.id, rr.title, rr.description, rr.priority, rr.status,  
                 rr.required_by_date, rr.created_at, rr.updated_at, rr.completed_at, rr.notes, 
                 rr.branch_id, rr.created_by, u.name, b.name
        ORDER BY rr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(DISTINCT rr.id) as total
        FROM restock_request rr
        WHERE rr.branch_id = ${branchId}
      `;
    }

    const total = parseInt(countResult[0]?.total || "0");
    const totalPages = Math.ceil(total / limit);

    // Format the response
    const requests = requestsResult.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      required_by_date: row.required_by_date,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at,
      notes: row.notes,
      branch_id: row.branch_id,
      created_by: row.created_by,
      created_by_name: row.created_by_name,
      branch_name: row.branch_name,
      item_count: parseInt(row.item_count || "0"),
      total_quantity_requested: parseInt(row.total_quantity_requested || "0"),
    }));

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Restock requests API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user info from headers
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user and their branch
    let userResult: any[] = [];

    if (userId) {
      // First try as Firebase UID
      userResult = await sql`
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

      // If no result, try as user_id
      if (userResult.length === 0) {
        userResult = await sql`
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
    }

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "User not found or not authorized" },
        { status: 403 }
      );
    }

    const user = userResult[0];
    const branchId = user.branch_id;
    const createdBy = user.user_id;

    // Parse request body
    const body = await request.json();
    const { title, description, priority, required_by_date, notes, items } =
      body;

    // Validate required fields
    if (!title || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Title and at least one item are required" },
        { status: 400 }
      );
    }

    // Create the restock request
    const requestResult = await sql`
      INSERT INTO restock_request (
        branch_id, 
        created_by, 
        title, 
        description, 
        priority, 
        required_by_date, 
        notes
      )
      VALUES (${branchId}, ${createdBy}, ${title}, ${
      description || null
    }, ${priority}, ${required_by_date || null}, ${notes || null})
      RETURNING id, created_at
    `;

    const newRequest = requestResult[0];
    const requestId = newRequest.id;

    // Insert restock request items
    for (const item of items) {
      await sql`
        INSERT INTO restock_request_item (
          restock_request_id,
          inventory_id,
          requested_quantity,
          notes
        )
        VALUES (
          ${requestId},
          ${item.inventory_id},
          ${item.requested_quantity},
          ${item.notes || null}
        )
      `;
    }

    return NextResponse.json(
      {
        success: true,
        request: {
          id: requestId,
          created_at: newRequest.created_at,
          items_count: items.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create restock request error:", error);
    return NextResponse.json(
      { error: "Failed to create restock request" },
      { status: 500 }
    );
  }
}
