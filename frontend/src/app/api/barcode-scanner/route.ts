import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/auth";

// In a real application, you would store this in Redis or a database
// For now, we'll use in-memory storage
const activeSessions = new Map<
  string,
  {
    userId: string;
    email: string;
    lastActivity: number;
  }
>();

// WebSocket connection details - this would be configured in your environment
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || "ws://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcode, userEmail } = body;

    if (!barcode || !userEmail) {
      return NextResponse.json(
        { error: "Barcode and user email are required" },
        { status: 400 }
      );
    }

    // Validate user authentication
    const userProfile = getUserProfile();
    if (!userProfile || userProfile.email !== userEmail) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Create session identifier
    const userId = `user_${Buffer.from(userEmail).toString("base64")}`;

    // Update session activity
    activeSessions.set(userId, {
      userId,
      email: userEmail,
      lastActivity: Date.now(),
    });

    // In a real implementation, you would send this via WebSocket
    // For now, we'll return success and let the client handle WebSocket communication

    return NextResponse.json({
      success: true,
      message: "Barcode scan processed",
      barcode,
      sessionId: userId,
      websocketUrl: WEBSOCKET_URL,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error processing barcode scan:", error);
    return NextResponse.json(
      { error: "Failed to process barcode scan" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");
    const action = searchParams.get("action");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Validate user authentication
    const userProfile = getUserProfile();
    if (!userProfile || userProfile.email !== userEmail) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const userId = `user_${Buffer.from(userEmail).toString("base64")}`;

    if (action === "get_session") {
      // Return session information for WebSocket connection
      return NextResponse.json({
        success: true,
        sessionId: userId,
        websocketUrl: WEBSOCKET_URL,
        email: userEmail,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Barcode scanner endpoint ready",
    });
  } catch (error) {
    console.error("Error in barcode scanner GET endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// Cleanup inactive sessions (called periodically)
// Note: This function is not exported as it's not a valid Next.js route export
// In production, this should be moved to a separate utility file or run as a background job
function cleanupInactiveSessions() {
  const now = Date.now();
  const INACTIVE_THRESHOLD = 30 * 60 * 1000; // 30 minutes

  activeSessions.forEach((session, userId) => {
    if (now - session.lastActivity > INACTIVE_THRESHOLD) {
      activeSessions.delete(userId);
      console.log(`Cleaned up inactive session for user: ${session.email}`);
    }
  });
}
