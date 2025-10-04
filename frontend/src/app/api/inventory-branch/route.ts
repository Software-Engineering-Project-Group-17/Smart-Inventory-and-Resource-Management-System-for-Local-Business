import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Get user info from headers (following resource management pattern)
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user and their branch (following resource management pattern)
    let userResult: any[] = [];

    if (userId) {
      // First try as Firebase UID
      userResult = await sql`
        SELECT u.user_id, u.email, u.firebase_uid, s.id as staff_id, s.branch_id, b.name as branch_name, b.location as branch_location
        FROM app_user u
        JOIN staff s ON u.user_id = s.user_id
        JOIN branches b ON s.branch_id = b.id
        WHERE u.firebase_uid = ${userId}
        LIMIT 1
      `;

      // If no result, try as user_id (for cases where frontend sends user_id instead of firebase_uid)
      if (userResult.length === 0) {
        // Only try parseInt if userId looks like a number
        if (!isNaN(Number(userId))) {
          userResult = await sql`
            SELECT u.user_id, u.email, u.firebase_uid, s.id as staff_id, s.branch_id, b.name as branch_name, b.location as branch_location
            FROM app_user u
            JOIN staff s ON u.user_id = s.user_id
            JOIN branches b ON s.branch_id = b.id
            WHERE u.user_id = ${parseInt(userId)}
            LIMIT 1
          `;
        }
      }
    }

    // If still no result and we have email, try by email
    if (userResult.length === 0 && userEmail) {
      userResult = await sql`
        SELECT u.user_id, u.email, u.firebase_uid, s.id as staff_id, s.branch_id, b.name as branch_name, b.location as branch_location
        FROM app_user u
        JOIN staff s ON u.user_id = s.user_id
        JOIN branches b ON s.branch_id = b.id
        WHERE u.email = ${userEmail}
        LIMIT 1
      `;
    }

    if (userResult.length === 0) {
      console.log("Inventory API - User not found with:", {
        userId,
        userEmail,
      });
      return NextResponse.json(
        { error: "User not found or not authorized" },
        { status: 403 }
      );
    }

    const user = userResult[0];
    const branchId = user.branch_id;

    // Get inventory items for the user's branch
    const inventoryResult = await sql`
      SELECT 
        i.inventory_id,
        i.inventory_name as item_name,
        i.barcode,
        i.quantity as current_stock,
        i.low_stock_threshold as reorder_level,
        i.unit_price,
        i.image_url,
        c.category_name
      FROM inventory_item i
      LEFT JOIN category c ON i.category_id = c.id
      WHERE i.branch_id = ${branchId}
      ORDER BY i.inventory_name
    `;

    // Get all categories for filtering
    const categoriesResult = await sql`
      SELECT id as category_id, category_name, category_img_url
      FROM category
      ORDER BY category_name
    `;

    // Format the response
    const inventory = inventoryResult.map((item: any) => ({
      inventoryId: item.inventory_id,
      itemName: item.item_name,
      barcode: item.barcode,
      description: null, // Not available in current schema
      categoryName: item.category_name || "Uncategorized",
      currentStock: item.current_stock,
      reorderLevel: item.reorder_level,
      unitPrice: parseFloat(item.unit_price),
      supplier: null, // Not available in current schema
      lastUpdated: new Date().toISOString(), // Use current timestamp since not available
      imageUrl: item.image_url,
    }));

    const categories = categoriesResult.map((cat: any) => ({
      categoryId: cat.category_id,
      categoryName: cat.category_name,
      description: null, // Not available in current schema
      imageUrl: cat.category_img_url,
    }));

    const branch = {
      branchId: user.branch_id,
      name: user.branch_name,
      location: user.branch_location,
    };

    return NextResponse.json({
      inventory,
      categories,
      branch,
    });
  } catch (error) {
    console.error("Inventory API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
