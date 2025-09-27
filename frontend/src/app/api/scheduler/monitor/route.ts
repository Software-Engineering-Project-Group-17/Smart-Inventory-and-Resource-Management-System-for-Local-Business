import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the monitoring API URL (assuming it's running on the same domain)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const monitoringUrl = `${baseUrl}/api/monitor-inventory`;

    // Call the monitoring service
    const response = await fetch(monitoringUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Monitoring service responded with status: ${response.status}`
      );
    }

    const result = await response.json();

    // Log the result
    console.log(`[SCHEDULER] Inventory monitoring completed:`, result);

    return NextResponse.json({
      success: true,
      message: "Scheduled monitoring completed successfully",
      result,
    });
  } catch (error) {
    console.error("[SCHEDULER] Error running scheduled monitoring:", error);
    return NextResponse.json(
      {
        error: "Failed to run scheduled monitoring",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: "Inventory monitoring scheduler is active",
      endpoints: {
        triggerMonitoring: "/api/scheduler/monitor",
        checkLowStock: "/api/check-low-stock",
        monitorInventory: "/api/monitor-inventory",
        notifications: "/api/notifications",
      },
      usage: {
        manual: "POST /api/scheduler/monitor - Manually trigger monitoring",
        automatic: "Set up a cron job to call this endpoint periodically",
      },
    });
  } catch (error) {
    console.error("Error in scheduler GET:", error);
    return NextResponse.json(
      { error: "Failed to get scheduler info" },
      { status: 500 }
    );
  }
}
