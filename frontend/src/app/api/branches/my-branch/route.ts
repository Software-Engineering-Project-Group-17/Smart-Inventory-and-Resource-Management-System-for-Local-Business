import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Get user identification from query params or headers
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("email") || request.headers.get("x-user-email");
    const userId = request.headers.get("x-user-id");
    
    // For now, we'll support both query param and header authentication
    // This matches your existing pattern in other API routes
    if (!userEmail && !userId) {
      return NextResponse.json(
        { success: false, error: "User email or ID required (provide via ?email= query param or x-user-email header)" },
        { status: 400 }
      );
    }

    console.log("Fetching branch for user:", { userEmail, userId });

    // Query to get user's branch information
    let result;

    if (userEmail) {
      // Try email first (most common case)
      result = await sql`
        SELECT 
          u.user_id,
          u.email,
          u.name,
          s.first_name,
          s.last_name,
          s.branch_id,
          b.id as branch_id,
          b.name as branch_name,
          b.location as branch_location,
          b.contact_number as branch_contact,
          b.description as branch_description,
          b.status as branch_status,
          b.created_at as branch_created_at,
          b.manager_id as branch_manager_id,
          b.owner_id as branch_owner_id
        FROM app_user u
        LEFT JOIN staff s ON u.user_id = s.user_id
        LEFT JOIN branches b ON s.branch_id = b.id
        WHERE u.email = ${userEmail}
        LIMIT 1
      `;
    } else if (userId) {
      // Try user_id as fallback
      result = await sql`
        SELECT 
          u.user_id,
          u.email,
          u.name,
          s.first_name,
          s.last_name,
          s.branch_id,
          b.id as branch_id,
          b.name as branch_name,
          b.location as branch_location,
          b.contact_number as branch_contact,
          b.description as branch_description,
          b.status as branch_status,
          b.created_at as branch_created_at,
          b.manager_id as branch_manager_id,
          b.owner_id as branch_owner_id
        FROM app_user u
        LEFT JOIN staff s ON u.user_id = s.user_id
        LEFT JOIN branches b ON s.branch_id = b.id
        WHERE u.user_id = ${userId}
        LIMIT 1
      `;
    }

    if (!result || result.length === 0) {
      console.log("No user found with provided identifiers");
      return NextResponse.json(
        { 
          success: false, 
          error: "User not found or not assigned to a branch",
          debug: { userEmail, userId }
        },
        { status: 404 }
      );
    }

    const userBranchInfo = result[0];

    // Check if user has a branch assigned
    if (!userBranchInfo.branch_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User is not assigned to any branch",
          user: {
            userId: userBranchInfo.user_id,
            email: userBranchInfo.email,
            name: userBranchInfo.name,
          }
        },
        { status: 404 }
      );
    }

    // Format response to match BranchResponse interface
    const branch = {
      id: userBranchInfo.branch_id,
      name: userBranchInfo.branch_name || "Unknown Branch",
      location: userBranchInfo.branch_location || "Unknown Location",
      contactNumber: userBranchInfo.branch_contact || "N/A",
      description: userBranchInfo.branch_description || "",
      status: userBranchInfo.branch_status || "ACTIVE",
      manager: userBranchInfo.branch_manager_id ? {
        id: userBranchInfo.branch_manager_id,
        name: "Manager", 
      } : null,
      createdAt: userBranchInfo.branch_created_at || new Date().toISOString(),
    };

    console.log("Successfully found branch for user:", {
      userId: userBranchInfo.user_id,
      email: userBranchInfo.email,
      branchId: branch.id,
      branchName: branch.name
    });

    return NextResponse.json({
      success: true,
      branch: branch,
      user: {
        userId: userBranchInfo.user_id,
        email: userBranchInfo.email,
        firstName: userBranchInfo.first_name,
        lastName: userBranchInfo.last_name,
      }
    });

  } catch (error) {
    const errorObj = error as any;
    console.error("Error fetching user branch:", error);
    
    // Check if it's a database connection error
    if (errorObj?.message?.includes('relation') && errorObj?.message?.includes('does not exist')) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Database schema mismatch - required tables not found",
          details: process.env.NODE_ENV === 'development' ? errorObj.message : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch user branch information",
        details: process.env.NODE_ENV === 'development' ? errorObj?.message : undefined
      },
      { status: 500 }
    );
  }
}