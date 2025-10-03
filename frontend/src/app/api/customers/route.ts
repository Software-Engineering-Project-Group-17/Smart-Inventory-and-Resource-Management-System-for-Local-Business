import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Database connection using Neon
const sql = neon(process.env.DATABASE_URL!);

// GET - Search customer by phone or get customer details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const customerId = searchParams.get("id");

    if (phone) {
      // Search customer by phone
      const customer = await sql`
        SELECT 
          id,
          customer_name,
          customer_tel,
          customer_email,
          address,
          loyalty_points,
          created_at
        FROM customer 
        WHERE customer_tel = ${phone}
      `;

      if (customer.length === 0) {
        return NextResponse.json({
          success: false,
          message: "Customer not found"
        });
      }

      return NextResponse.json({
        success: true,
        customer: {
          id: customer[0].id,
          name: customer[0].customer_name,
          phone: customer[0].customer_tel,
          email: customer[0].customer_email,
          address: customer[0].address,
          loyaltyPoints: parseFloat(customer[0].loyalty_points) || 0,
          isRegistered: true
        }
      });
    }

    if (customerId) {
      // Get customer by ID with order history
      const customer = await sql`
        SELECT 
          c.id,
          c.customer_name,
          c.customer_tel,
          c.customer_email,
          c.address,
          c.loyalty_points,
          c.created_at,
          COUNT(co.id) as total_orders,
          COALESCE(SUM(co.total_amount), 0) as total_spent
        FROM customer c
        LEFT JOIN customer_order co ON c.id = co.customer_id
        WHERE c.id = ${customerId}
        GROUP BY c.id, c.customer_name, c.customer_tel, c.customer_email, c.address, c.loyalty_points, c.created_at
      `;

      if (customer.length === 0) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        customer: {
          id: customer[0].id,
          name: customer[0].customer_name,
          phone: customer[0].customer_tel,
          email: customer[0].customer_email,
          address: customer[0].address,
          loyaltyPoints: parseFloat(customer[0].loyalty_points) || 0,
          totalOrders: parseInt(customer[0].total_orders) || 0,
          totalSpent: parseFloat(customer[0].total_spent) || 0,
          isRegistered: true
        }
      });
    }

    return NextResponse.json(
      { error: "Phone number or customer ID is required" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, address } = body;

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await sql`
      SELECT id FROM customer WHERE customer_tel = ${phone}
    `;

    if (existingCustomer.length > 0) {
      return NextResponse.json(
        { error: "Customer with this phone number already exists" },
        { status: 409 }
      );
    }

    // Create new customer
    const result = await sql`
      INSERT INTO customer (customer_name, customer_tel, customer_email, address, loyalty_points, created_at)
      VALUES (${name}, ${phone}, ${email || null}, ${address || null}, 0, NOW())
      RETURNING id, customer_name, customer_tel, customer_email, address, loyalty_points
    `;

    return NextResponse.json({
      success: true,
      customer: {
        id: result[0].id,
        name: result[0].customer_name,
        phone: result[0].customer_tel,
        email: result[0].customer_email,
        address: result[0].address,
        loyaltyPoints: 0,
        isRegistered: true
      }
    });

  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

// PUT - Update customer information
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, email, address } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Update customer
    const result = await sql`
      UPDATE customer 
      SET 
        customer_name = ${name},
        customer_tel = ${phone},
        customer_email = ${email || null},
        address = ${address || null}
      WHERE id = ${id}
      RETURNING id, customer_name, customer_tel, customer_email, address, loyalty_points
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: result[0].id,
        name: result[0].customer_name,
        phone: result[0].customer_tel,
        email: result[0].customer_email,
        address: result[0].address,
        loyaltyPoints: parseFloat(result[0].loyalty_points) || 0,
        isRegistered: true
      }
    });

  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}
