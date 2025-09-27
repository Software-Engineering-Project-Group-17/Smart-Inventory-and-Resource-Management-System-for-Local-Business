import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const categoryName = searchParams.get("categoryName");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");

    const client = await pool.connect();

    let query = `
      SELECT 
        ii.inventory_id,
        ii.inventory_name,
        ii.unit_price,
        ii.image_url,
        ii.quantity,
        c.category_name
      FROM inventory_item ii
      LEFT JOIN category c ON ii.category_id = c.id
      WHERE ii.quantity >= 0 AND ii.branch_id = 3
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    // Add category filter if provided (by ID)
    if (categoryId && categoryId !== "all") {
      query += ` AND ii.category_id = $${paramIndex}`;
      queryParams.push(parseInt(categoryId));
      paramIndex++;
    }

    // Add category filter if provided (by name)
    if (categoryName && categoryName !== "all") {
      query += ` AND LOWER(c.category_name) = LOWER($${paramIndex})`;
      queryParams.push(categoryName);
      paramIndex++;
    }

    // Add search filter if provided
    if (search) {
      query += ` AND ii.inventory_name ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Add order and limit
    query += ` ORDER BY ii.inventory_id DESC`;

    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      queryParams.push(parseInt(limit));
    }

    const result = await client.query(query, queryParams);
    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
