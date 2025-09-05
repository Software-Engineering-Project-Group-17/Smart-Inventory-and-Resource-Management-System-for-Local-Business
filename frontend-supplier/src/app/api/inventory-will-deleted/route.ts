// app/api/inventory/route.ts
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // In a real app, you would get branch_id from the authenticated user
    const branchId = 3; // Example branch ID

    const inventoryItems = await sql`
      SELECT 
        inventory_id, 
        inventory_name, 
        quantity, 
        low_stock_threshold, 
        unit_price, 
        image_url,
        category_id
      FROM inventory_item 
      WHERE branch_id = ${branchId}
      ORDER BY inventory_name
    `;

    return NextResponse.json(inventoryItems);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
