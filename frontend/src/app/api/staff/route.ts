import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database/connection";

// GET /api/staff?email=user@example.com - Get staff details by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email parameter is required" },
        { status: 400 }
      );
    }

    const staffResult = await sql`
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        s.email,
        s.tel,
        s.branch_id,
        b.name as branch_name
      FROM staff s
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE s.email = ${email} AND s.is_active = true
    `;

    if (staffResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "Staff member not found" },
        { status: 404 }
      );
    }

    const staff = staffResult[0] as any;

    return NextResponse.json({
      success: true,
      data: {
        id: staff.id,
        name: `${staff.first_name} ${staff.last_name}`,
        email: staff.email,
        phone: staff.tel || "",
        branchId: staff.branch_id,
        branchName: staff.branch_name || "",
      },
    });
  } catch (error) {
    console.error("Failed to fetch staff:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { success: false, message: "Failed to fetch staff", error: errorMessage },
      { status: 500 }
    );
  }
}
