import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { NotificationService } from "@/lib/notification-service";

// Database connection using Neon
const sql = neon(process.env.DATABASE_URL!);

// GET - Search inventory items for sales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search");
    const searchType = searchParams.get("type") || "name"; // 'name' or 'barcode'
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Get user's branch_id from staff table
    const staffResult = await sql`
      SELECT s.branch_id 
      FROM staff s 
      WHERE s.email = ${userEmail} AND s.is_active = true
    `;

    if (staffResult.length === 0) {
      return NextResponse.json(
        { error: "Staff record not found for this user" },
        { status: 404 }
      );
    }

    const { branch_id } = staffResult[0];

    let inventory = [];

    if (searchTerm && searchTerm.trim() !== "") {
      // Search inventory based on type
      if (searchType === "barcode") {
        inventory = await sql`
          SELECT 
            ii.inventory_id as id,
            ii.inventory_name as name,
            ii.barcode,
            ii.unit_price as price,
            ii.quantity as stock,
            c.category_name as category,
            ii.image_url
          FROM inventory_item ii
          LEFT JOIN category c ON ii.category_id = c.id
          WHERE ii.branch_id = ${branch_id} 
            AND ii.barcode ILIKE ${`%${searchTerm}%`}
            AND ii.quantity > 0
          ORDER BY ii.inventory_name ASC
          LIMIT 20
        `;
      } else {
        inventory = await sql`
          SELECT 
            ii.inventory_id as id,
            ii.inventory_name as name,
            ii.barcode,
            ii.unit_price as price,
            ii.quantity as stock,
            c.category_name as category,
            ii.image_url
          FROM inventory_item ii
          LEFT JOIN category c ON ii.category_id = c.id
          WHERE ii.branch_id = ${branch_id} 
            AND ii.inventory_name ILIKE ${`%${searchTerm}%`}
            AND ii.quantity > 0
          ORDER BY ii.inventory_name ASC
          LIMIT 20
        `;
      }
    } else {
      // Return all available inventory if no search term
      inventory = await sql`
        SELECT 
          ii.inventory_id as id,
          ii.inventory_name as name,
          ii.barcode,
          ii.unit_price as price,
          ii.quantity as stock,
          c.category_name as category,
          ii.image_url
        FROM inventory_item ii
        LEFT JOIN category c ON ii.category_id = c.id
        WHERE ii.branch_id = ${branch_id} 
          AND ii.quantity > 0
        ORDER BY ii.inventory_name ASC
        LIMIT 50
      `;
    }

    return NextResponse.json({
      success: true,
      inventory: inventory.map(item => ({
        id: item.id,
        name: item.name,
        barcode: item.barcode || "",
        price: parseFloat(item.price) || 0,
        stock: parseInt(item.stock) || 0,
        category: item.category || "Uncategorized"
      }))
    });

  } catch (error) {
    console.error("Error searching inventory:", error);
    return NextResponse.json(
      { error: "Failed to search inventory" },
      { status: 500 }
    );
  }
}

// POST - Process sales transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      customerInfo,
      paymentAmount,
      loyaltyPointsUsed = 0,
      loyaltyPointsToAdd = 0,
      userEmail,
      total,
      subtotal,
      totalDiscount
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Get user's branch_id from staff table
    const staffResult = await sql`
      SELECT s.branch_id
      FROM staff s 
      WHERE s.email = ${userEmail} AND s.is_active = true
    `;

    if (staffResult.length === 0) {
      return NextResponse.json(
        { error: "Staff record not found for this user" },
        { status: 404 }
      );
    }

    const { branch_id } = staffResult[0];

    // Start transaction
    let customerId = null;

    // Handle customer information (optional for guest orders)
    if (customerInfo && customerInfo.name && customerInfo.phone && customerInfo.isRegistered) {
      // Check if customer exists
      const existingCustomer = await sql`
        SELECT id, loyalty_points FROM customer 
        WHERE customer_tel = ${customerInfo.phone}
      `;

      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
        
        // Update loyalty points if used
        if (loyaltyPointsUsed > 0) {
          await sql`
            UPDATE customer 
            SET loyalty_points = loyalty_points - ${loyaltyPointsUsed}
            WHERE id = ${customerId}
          `;
        }
        
        // Add loyalty points if specified (from change)
        if (loyaltyPointsToAdd > 0) {
          await sql`
            UPDATE customer 
            SET loyalty_points = loyalty_points + ${loyaltyPointsToAdd}
            WHERE id = ${customerId}
          `;
        }
      } else {
        // Create new customer only if they want to be registered
        const newCustomer = await sql`
          INSERT INTO customer (customer_name, customer_tel, loyalty_points, created_at)
          VALUES (${customerInfo.name}, ${customerInfo.phone}, 0, NOW())
          RETURNING id
        `;
        customerId = newCustomer[0].id;
      }
    }

    // Create customer order
    const orderResult = await sql`
      INSERT INTO customer_order (
        customer_id, 
        total_amount, 
        payment_status, 
        created_at,
        branch_id
      )
      VALUES (
        ${customerId}, 
        ${total}, 
        'paid',
        NOW(),
        ${branch_id}
      )
      RETURNING id
    `;

    const orderId = orderResult[0].id;

    // Create order items and update inventory
    for (const item of items) {
      // Check current stock
      const stockCheck = await sql`
        SELECT quantity FROM inventory_item 
        WHERE inventory_id = ${item.id} AND branch_id = ${branch_id}
      `;

      if (stockCheck.length === 0 || stockCheck[0].quantity < item.quantity) {
        throw new Error(`Insufficient stock for item: ${item.name}`);
      }

      // Create order item
      await sql`
        INSERT INTO order_item (
          order_id,
          inventory_id,
          quantity,
          unit_price
        )
        VALUES (
          ${orderId},
          ${item.id},
          ${item.quantity},
          ${item.price}
        )
      `;

      // Update inventory quantity
      await sql`
        UPDATE inventory_item 
        SET quantity = quantity - ${item.quantity}
        WHERE inventory_id = ${item.id} AND branch_id = ${branch_id}
      `;

      // Check for low stock notification after inventory update
      try {
        await NotificationService.checkAndCreateLowStockNotification(item.id);
      } catch (notificationError) {
        console.error(`Failed to check low stock notification for item ${item.id}:`, notificationError);
        // Don't fail the sale if notification fails
      }
    }

    // Create payment record
    await sql`
      INSERT INTO payment (
        order_id,
        amount,
        payment_method,
        payment_status,
        created_at
      )
      VALUES (
        ${orderId},
        ${paymentAmount},
        'cash',
        'paid',
        NOW()
      )
    `;

    // Generate invoice number
    const invoiceNumber = `INV-${orderId.toString().padStart(6, '0')}`;

    return NextResponse.json({
      success: true,
      orderId,
      invoiceNumber,
      message: "Sale completed successfully"
    });

  } catch (error) {
    console.error("Error processing sale:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process sale" },
      { status: 500 }
    );
  }
}
