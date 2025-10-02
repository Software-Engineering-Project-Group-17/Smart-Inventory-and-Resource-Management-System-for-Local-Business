import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const productId = id;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get branch ID from environment variable
    const branchId = process.env.BRANCH_ID;
    if (!branchId) {
      return NextResponse.json(
        { error: "Branch ID not configured" },
        { status: 500 }
      );
    }

    const client = await pool.connect();

    // Get product details with category information, filtered by branch
    const result = await client.query(
      `
      SELECT 
        ii.inventory_id,
        ii.inventory_name,
        ii.unit_price,
        ii.image_url,
        ii.quantity,
        ii.low_stock_threshold,
        ii.category_id,
        c.category_name,
        c.category_img_url,
        b.name as branch_name,
        b.location as branch_location
      FROM inventory_item ii
      LEFT JOIN category c ON ii.category_id = c.id
      LEFT JOIN branches b ON ii.branch_id = b.id
      WHERE ii.inventory_id = $1 AND ii.branch_id = $2
      `,
      [parseInt(productId), parseInt(branchId)]
    );

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = result.rows[0];

    // Add computed fields
    const enrichedProduct = {
      ...product,
      is_low_stock: product.quantity <= product.low_stock_threshold,
      is_in_stock: product.quantity > 0,
      stock_status:
        product.quantity > 0
          ? product.quantity <= product.low_stock_threshold
            ? "low_stock"
            : "in_stock"
          : "out_of_stock",
    };

    return NextResponse.json(enrichedProduct, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  }
}
