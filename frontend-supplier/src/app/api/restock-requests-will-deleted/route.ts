// app/api/restock-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const {
      branch_id,
      created_by,
      title,
      description,
      priority,
      required_by_date,
      notes,
      total_estimated_cost,
      items,
    } = await request.json();

    // Start a transaction
    await sql`BEGIN`;

    // Create the restock request
    const restockRequest = await sql`
      INSERT INTO restock_request 
        (branch_id, created_by, title, description, priority, required_by_date, notes, total_estimated_cost)
      VALUES 
        (${branch_id}, ${created_by}, ${title}, ${description}, ${priority}, ${required_by_date}, ${notes}, ${total_estimated_cost})
      RETURNING id
    `;

    const requestId = restockRequest[0].id;

    // Add all items to the request
    for (const item of items) {
      await sql`
        INSERT INTO restock_request_item 
          (restock_request_id, inventory_id, requested_quantity, estimated_unit_price, notes)
        VALUES 
          (${requestId}, ${item.inventory_id}, ${item.requested_quantity}, ${item.estimated_unit_price}, ${item.notes})
      `;
    }

    // Commit the transaction
    await sql`COMMIT`;

    return NextResponse.json(
      { message: "Restock request created successfully", requestId },
      { status: 201 }
    );
  } catch (error) {
    // Rollback in case of error
    await sql`ROLLBACK`;

    console.error("Error creating restock request:", error);
    return NextResponse.json(
      { error: "Failed to create restock request" },
      { status: 500 }
    );
  }
}
