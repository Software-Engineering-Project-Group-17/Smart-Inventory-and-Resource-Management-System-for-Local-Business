import { neon } from "@neondatabase/serverless";

// Database connection
export const sql = neon(process.env.DATABASE_URL!);

// Database types for resources
export interface DatabaseResource {
  id: number;
  name: string;
  resource_number: string;
  description?: string;
  resource_type: string;
  availability_status: "available" | "under_maintenance" | "used";
  branch_id: number;
  current_assignee_id?: number;
  assigned_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
}

export interface DatabaseAssignment {
  id: number;
  staff_id: number;
  resource_id: number;
  purpose?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  assigned_at: string;
  assigned_by?: number;
  is_active: boolean;
  unassigned_at?: string;
  unassigned_by?: number;
}

export interface DatabaseStaff {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  tel?: string;
  branch_id?: number;
}

// Resource view with assignment details
export interface ResourceWithAssignment {
  id: number;
  name: string;
  resource_number: string;
  description?: string;
  resource_type: string;
  availability_status: "available" | "under_maintenance" | "used";
  branch_id: number;
  created_at: string;
  updated_at: string;
  created_by?: number;

  // Assignment details (nullable)
  assignment_id?: number;
  purpose?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  assigned_at?: string;

  // Staff details (nullable)
  staff_id?: number;
  first_name?: string;
  last_name?: string;
  staff_email?: string;
  staff_phone?: string;

  // Branch details
  branch_name?: string;
  branch_location?: string;
}

// Helper function to transform database resource to frontend format
export function transformResource(dbResource: ResourceWithAssignment) {
  return {
    id: dbResource.id,
    name: dbResource.name,
    details: dbResource.description || "",
    isAvailable:
      dbResource.availability_status === "available" &&
      !dbResource.assignment_id,
    resourceNumber: dbResource.resource_number,
    resourceType: dbResource.resource_type,
    branchId: dbResource.branch_id,
    createdAt: dbResource.created_at,
    updatedAt: dbResource.updated_at,
  };
}

// Helper function to transform database assignment to frontend format
export function transformAssignment(dbResource: ResourceWithAssignment) {
  if (!dbResource.assignment_id || !dbResource.staff_id) {
    return null;
  }

  return {
    id: dbResource.assignment_id,
    resourceId: dbResource.id,
    resourceName: dbResource.name,
    email: dbResource.staff_email || "",
    staffName: `${dbResource.first_name || ""} ${
      dbResource.last_name || ""
    }`.trim(),
    phone: dbResource.staff_phone || "",
    purpose: dbResource.purpose || "",
    startDate: dbResource.start_date || "",
    endDate: dbResource.end_date || "",
    startTime: dbResource.start_time || "",
    endTime: dbResource.end_time || "",
  };
}

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    return { success: true, message: "Database connected successfully" };
  } catch (error) {
    console.error("Database connection failed:", error);
    return { success: false, message: "Database connection failed", error };
  }
}
