import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth, createAuthResponse } from "@/lib/requireAuth";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and check permissions
    const authResult = await requireAuth(request, ["BRANCH_MANAGER", "STAFF"]);
    const authResponse = createAuthResponse(authResult);
    if (authResponse) return authResponse;

    // Get authenticated user data
    const user = authResult.user!;

    // Get filtering and pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("payment_status");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const customerId = searchParams.get("customer_id");

    const offset = (page - 1) * limit;

    // Determine which branch to use based on user role
    let branchId = user.branchId;

    // If OWNER and no branch ID, get the first branch they own
    if (user.role === "OWNER" && !branchId && user.ownerId) {
      const ownerBranchResult = await sql`
        SELECT id, name, location 
        FROM branches 
        WHERE owner_id = ${user.userId} 
        ORDER BY id 
        LIMIT 1
      `;

      if (ownerBranchResult.length > 0) {
        branchId = ownerBranchResult[0].id;
      }
    }

    if (!branchId) {
      return NextResponse.json(
        { success: false, error: "User is not associated with a branch" },
        { status: 403 }
      );
    }

    // Get branch information
    const branchResult = await sql`
      SELECT id, name, location 
      FROM branches 
      WHERE id = ${branchId}
    `;

    if (branchResult.length === 0) {
      return NextResponse.json(
        { success: false, error: "Branch not found" },
        { status: 404 }
      );
    }

    const branch = branchResult[0];

    // Build the WHERE clause for filtering
    let whereConditions = [`co.branch_id = ${branchId}`];
    let dynamicParams: any[] = [];

    if (status) {
      whereConditions.push(`co.order_status = '${status}'`);
    }

    if (paymentStatus) {
      whereConditions.push(`co.payment_status = '${paymentStatus}'`);
    }

    if (customerId) {
      whereConditions.push(`co.customer_id = ${parseInt(customerId)}`);
    }

    if (startDate) {
      whereConditions.push(`co.created_at >= '${startDate}'`);
    }

    if (endDate) {
      whereConditions.push(`co.created_at <= '${endDate} 23:59:59'`);
    }

    const whereClause = whereConditions.join(" AND ");

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM customer_order co
      WHERE ${sql.unsafe(whereClause)}
    `;

    const totalOrders = parseInt(String(countResult[0]?.total || 0));
    const totalPages = Math.ceil(totalOrders / limit);

    // Main query to get orders with details
    const orders = await sql`
      SELECT 
        co.id,
        co.customer_id,
        co.order_status,
        co.payment_status,
        co.total_amount,
        co.created_at,
        co.updated_at,
        co.shipping_address,
        co.stripe_payment_intent_id,
        co.notes,
        
        -- Customer details
        c.customer_name,
        c.customer_email,
        c.customer_tel,
        c.address as customer_address,
        
        -- Order summary
        COUNT(oi.id) as item_count,
        SUM(oi.quantity) as total_quantity,
        
        -- Order items (aggregated)
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', oi.id,
            'inventory_id', oi.inventory_id,
            'inventory_name', ii.inventory_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price,
            'category_name', cat.category_name
          ) ORDER BY oi.id
        ) as items
        
      FROM customer_order co
      LEFT JOIN customer c ON co.customer_id = c.id
      LEFT JOIN order_item oi ON co.id = oi.order_id
      LEFT JOIN inventory_item ii ON oi.inventory_id = ii.inventory_id
      LEFT JOIN category cat ON ii.category_id = cat.id
      
      WHERE ${sql.unsafe(whereClause)}
      
      GROUP BY 
        co.id, co.customer_id, co.order_status, co.payment_status, 
        co.total_amount, co.created_at, co.updated_at, co.shipping_address,
        co.stripe_payment_intent_id, co.notes,
        c.customer_name, c.customer_email, c.customer_tel, c.address
        
      ORDER BY co.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Get summary statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN co.order_status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN co.order_status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN co.order_status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN co.order_status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN co.payment_status = 'paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN co.payment_status = 'unpaid' THEN 1 END) as unpaid_orders,
        COALESCE(SUM(CASE WHEN co.payment_status = 'paid' THEN co.total_amount END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN co.payment_status = 'paid' THEN co.total_amount END), 0) as average_order_value
      FROM customer_order co
      WHERE co.branch_id = ${branchId}
        ${startDate ? sql`AND co.created_at >= ${startDate}` : sql``}
        ${endDate ? sql`AND co.created_at <= ${endDate + " 23:59:59"}` : sql``}
    `;

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_orders: totalOrders,
          limit,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
        branch: {
          id: branchId,
          name: branch.name,
          location: branch.location,
        },
        statistics: stats[0] || {},
        filters: {
          status,
          payment_status: paymentStatus,
          start_date: startDate,
          end_date: endDate,
          customer_id: customerId,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
