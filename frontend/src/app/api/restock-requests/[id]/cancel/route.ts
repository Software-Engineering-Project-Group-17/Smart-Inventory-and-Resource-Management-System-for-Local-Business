import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const requestId = id;

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Get user info from headers
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`Cancelling restock request ${requestId} by user ${userEmail}`);

    // Check if request exists and can be cancelled
    const [existingRequest] = await sql`
      SELECT 
        id,
        status,
        title,
        created_by
      FROM restock_request 
      WHERE id = ${requestId}
    `;

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Restock request not found" },
        { status: 404 }
      );
    }

    // Check if request can be cancelled
    if (existingRequest.status === "cancelled") {
      return NextResponse.json(
        { error: "Request is already cancelled" },
        { status: 400 }
      );
    }

    if (existingRequest.status === "completed") {
      return NextResponse.json(
        { error: "Cannot cancel a completed request" },
        { status: 400 }
      );
    }

    // Update request status to cancelled
    await sql`
      UPDATE restock_request 
      SET 
        status = 'cancelled',
        updated_at = now()
      WHERE id = ${requestId}
    `;

    // Also cancel any unpaid supplier orders for this request
    await sql`
      UPDATE supplier_order 
      SET 
        order_status = 'cancelled',
        updated_at = now()
      WHERE restock_request_id = ${requestId}
      AND payment_status = 'unpaid'
      AND order_status != 'cancelled'
    `;

    console.log(
      `Successfully cancelled restock request ${requestId} and related unpaid orders`
    );

    return NextResponse.json({
      success: true,
      message: "Restock request cancelled successfully",
      request_id: requestId,
    });
  } catch (error) {
    console.error("Error cancelling restock request:", error);
    return NextResponse.json(
      { error: "Failed to cancel restock request" },
      { status: 500 }
    );
  }
}
