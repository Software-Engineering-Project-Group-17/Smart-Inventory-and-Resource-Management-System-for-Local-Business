import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import {
  RestockRequestsResponse,
  RestockRequestFilters,
  PaginationParams,
} from "@/types/supplier-restock";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: RestockRequestFilters = {
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      branch_id: searchParams.get("branch_id")
        ? parseInt(searchParams.get("branch_id")!)
        : undefined,
      search: searchParams.get("search") || undefined,
      required_by_date_from:
        searchParams.get("required_by_date_from") || undefined,
      required_by_date_to: searchParams.get("required_by_date_to") || undefined,
    };

    const pagination: PaginationParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      sort_by: searchParams.get("sort_by") || "created_at",
      sort_order: (searchParams.get("sort_order") as "asc" | "desc") || "desc",
    };

    const client = await pool.connect();

    try {
      // Build the WHERE clause dynamically
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Only show active requests to suppliers (not drafts)
      whereConditions.push("rr.status IN ('pending', 'active')");

      if (filters.status) {
        whereConditions.push(`rr.status = $${paramIndex}`);
        queryParams.push(filters.status);
        paramIndex++;
      }

      if (filters.priority) {
        whereConditions.push(`rr.priority = $${paramIndex}`);
        queryParams.push(filters.priority);
        paramIndex++;
      }

      if (filters.branch_id) {
        whereConditions.push(`rr.branch_id = $${paramIndex}`);
        queryParams.push(filters.branch_id);
        paramIndex++;
      }

      if (filters.search) {
        whereConditions.push(
          `(rr.title ILIKE $${paramIndex} OR rr.description ILIKE $${paramIndex} OR b.name ILIKE $${paramIndex})`
        );
        queryParams.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters.required_by_date_from) {
        whereConditions.push(`rr.required_by_date >= $${paramIndex}`);
        queryParams.push(filters.required_by_date_from);
        paramIndex++;
      }

      if (filters.required_by_date_to) {
        whereConditions.push(`rr.required_by_date <= $${paramIndex}`);
        queryParams.push(filters.required_by_date_to);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(DISTINCT rr.id) as total_count
        FROM restock_request rr
        LEFT JOIN branches b ON rr.branch_id = b.id
        LEFT JOIN app_user u ON rr.created_by = u.user_id
        ${whereClause}
      `;

      const countResult = await client.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total_count);

      // Calculate pagination
      const offset = (pagination.page! - 1) * pagination.limit!;
      queryParams.push(pagination.limit, offset);
      const limitParamIndex = paramIndex;
      const offsetParamIndex = paramIndex + 1;

      // Main query with enhanced data
      const restockRequestsQuery = `
        SELECT 
          rr.id,
          rr.branch_id,
          rr.created_by,
          rr.title,
          rr.description,
          rr.status,
          rr.total_estimated_cost,
          rr.priority,
          rr.required_by_date,
          rr.created_at,
          rr.updated_at,
          rr.completed_at,
          rr.notes,
          
          -- Branch details
          b.name as branch_name,
          b.location as branch_location,
          
          -- Creator details
          u.name as created_by_name,
          u.email as created_by_email,
          
          -- Request statistics
          COUNT(DISTINCT rri.id) as total_items_requested,
          COALESCE(SUM(rri.requested_quantity), 0) as total_quantity_requested,
          COUNT(DISTINCT so.id) as supplier_orders_count,
          COUNT(CASE WHEN so.payment_status = 'paid' THEN 1 END) as paid_orders_count,
          COALESCE(SUM(CASE WHEN so.payment_status = 'paid' THEN so.total_amount ELSE 0 END), 0) as total_paid_amount
          
        FROM restock_request rr
        LEFT JOIN branches b ON rr.branch_id = b.id
        LEFT JOIN app_user u ON rr.created_by = u.user_id
        LEFT JOIN restock_request_item rri ON rr.id = rri.restock_request_id
        LEFT JOIN supplier_order so ON rr.id = so.restock_request_id
        ${whereClause}
        GROUP BY rr.id, rr.branch_id, rr.created_by, rr.title, rr.description, rr.status, 
                 rr.total_estimated_cost, rr.priority, rr.required_by_date, rr.created_at, 
                 rr.updated_at, rr.completed_at, rr.notes, b.name, b.location, u.name, u.email
        ORDER BY rr.${pagination.sort_by} ${pagination.sort_order}
        LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
      `;

      const requestsResult = await client.query(
        restockRequestsQuery,
        queryParams
      );

      const response: RestockRequestsResponse = {
        requests: requestsResult.rows.map((row) => ({
          id: row.id,
          branch_id: row.branch_id,
          created_by: row.created_by,
          title: row.title,
          description: row.description,
          status: row.status,
          total_estimated_cost: parseFloat(row.total_estimated_cost || 0),
          priority: row.priority,
          required_by_date: row.required_by_date,
          created_at: row.created_at,
          updated_at: row.updated_at,
          completed_at: row.completed_at,
          notes: row.notes,
          branch_name: row.branch_name,
          branch_location: row.branch_location,
          created_by_name: row.created_by_name,
          created_by_email: row.created_by_email,
          total_items_requested: parseInt(row.total_items_requested || 0),
          total_quantity_requested: parseInt(row.total_quantity_requested || 0),
          supplier_orders_count: parseInt(row.supplier_orders_count || 0),
          paid_orders_count: parseInt(row.paid_orders_count || 0),
          total_paid_amount: parseFloat(row.total_paid_amount || 0),
        })),
        total_count: totalCount,
        page: pagination.page!,
        limit: pagination.limit!,
      };

      return NextResponse.json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching restock requests:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
