import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Database connection using Neon
const sql = neon(process.env.DATABASE_URL!);

// PUT - Update customer loyalty points (add or deduct)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, pointsChange, operation, description } = body;

    // Validate required fields
    if (!customerId || !pointsChange || !operation) {
      return NextResponse.json(
        { error: "Customer ID, points change, and operation are required" },
        { status: 400 }
      );
    }

    if (!['add', 'deduct'].includes(operation)) {
      return NextResponse.json(
        { error: "Operation must be 'add' or 'deduct'" },
        { status: 400 }
      );
    }

    // Get current customer info
    const currentCustomer = await sql`
      SELECT id, customer_name, customer_tel, loyalty_points 
      FROM customer 
      WHERE id = ${customerId}
    `;

    if (currentCustomer.length === 0) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const currentPoints = parseFloat(currentCustomer[0].loyalty_points) || 0;
    let newPoints = currentPoints;

    if (operation === 'add') {
      newPoints = currentPoints + Math.abs(pointsChange);
    } else if (operation === 'deduct') {
      newPoints = Math.max(0, currentPoints - Math.abs(pointsChange));
    }

    // Update customer loyalty points
    const updatedCustomer = await sql`
      UPDATE customer 
      SET loyalty_points = ${newPoints}
      WHERE id = ${customerId}
      RETURNING id, customer_name, customer_tel, customer_email, loyalty_points
    `;

    return NextResponse.json({
      success: true,
      customer: {
        id: updatedCustomer[0].id,
        name: updatedCustomer[0].customer_name,
        phone: updatedCustomer[0].customer_tel,
        email: updatedCustomer[0].customer_email,
        loyaltyPoints: newPoints,
        previousPoints: currentPoints,
        pointsChange: operation === 'add' ? pointsChange : -pointsChange
      }
    });

  } catch (error) {
    console.error("Error updating loyalty points:", error);
    return NextResponse.json(
      { error: "Failed to update loyalty points" },
      { status: 500 }
    );
  }
}

// GET - Get customer loyalty points info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Get customer loyalty points info
    const customer = await sql`
      SELECT 
        id,
        customer_name,
        customer_tel,
        customer_email,
        loyalty_points,
        created_at
      FROM customer
      WHERE id = ${customerId}
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
        loyaltyPoints: parseFloat(customer[0].loyalty_points) || 0,
        memberSince: customer[0].created_at
      }
    });

  } catch (error) {
    console.error("Error fetching customer loyalty info:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer loyalty info" },
      { status: 500 }
    );
  }
}