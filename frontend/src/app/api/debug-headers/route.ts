import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get user info from headers
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    return NextResponse.json({
      success: true,
      receivedHeaders: {
        userId,
        userEmail,
        allHeaders: Object.fromEntries(request.headers.entries()),
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to debug headers" },
      { status: 500 }
    );
  }
}
