const API_BASE_URL = "http://localhost:8084";

// Interface for the old StaffController endpoint (deprecated)
export interface StaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  tel?: string;
  address?: string;
  salary: number;
  staffTypes: string[];
  branchId?: number;
  managerFirebaseUid?: string;
}

// Interface for the new RoleController endpoint (recommended)
export interface CreateStaffRequest {
  creatorFirebaseUid: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  staffTypes: string[];
  salary: number;
}

export interface StaffResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  tel?: string;
  salary: number;
  staffTypes: string[];
  branchId: number;
  branchName: string;
  managerId: number;
  managerName: string;
  userFirebaseUid: string;
}

export const staffAPI = {
  // New method using RoleController endpoint (recommended)
  async createStaffMember(
    staffData: CreateStaffRequest,
    token: string
  ): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/roles/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(staffData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create staff member");
    }

    return response.text(); // Returns success message from backend
  },

  // Old method using StaffController endpoint (deprecated)
  async createStaff(
    staffData: StaffRequest,
    token: string
  ): Promise<StaffResponse> {
    // Convert string array to uppercase enum format expected by backend
    const requestData = {
      ...staffData,
      staffTypes: staffData.staffTypes.map((type) => type.toUpperCase()),
    };

    const response = await fetch(`${API_BASE_URL}/api/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create staff: ${errorText}`);
    }

    const responseData = await response.json();

    // Convert backend enum response to frontend string array format
    return {
      ...responseData,
      staffTypes: Array.isArray(responseData.staffTypes)
        ? responseData.staffTypes.map((type: any) =>
            typeof type === "string" ? type : type.toString()
          )
        : [],
    };
  },

  async getStaffByManager(token: string): Promise<{ staff: StaffResponse[] }> {
    const response = await fetch(`${API_BASE_URL}/api/staff/by-manager`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch staff: ${errorText}`);
    }

    const responseData = await response.json();

    // Convert backend enum response to frontend string array format
    const convertedStaff = responseData.staff.map((staff: any) => ({
      ...staff,
      staffTypes: Array.isArray(staff.staffTypes)
        ? staff.staffTypes.map((type: any) =>
            typeof type === "string" ? type : type.toString()
          )
        : [],
    }));

    return { staff: convertedStaff };
  },

  async getStaffByBranch(
    branchId: number,
    token: string
  ): Promise<{ staff: StaffResponse[] }> {
    const response = await fetch(
      `${API_BASE_URL}/api/staff/by-branch/${branchId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch staff: ${errorText}`);
    }

    const responseData = await response.json();

    // Convert backend enum response to frontend string array format
    const convertedStaff = responseData.staff.map((staff: any) => ({
      ...staff,
      staffTypes: Array.isArray(staff.staffTypes)
        ? staff.staffTypes.map((type: any) =>
            typeof type === "string" ? type : type.toString()
          )
        : [],
    }));

    return { staff: convertedStaff };
  },

  async getStaffById(staffId: number, token: string): Promise<StaffResponse> {
    const response = await fetch(`${API_BASE_URL}/api/staff/${staffId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch staff: ${errorText}`);
    }

    const responseData = await response.json();

    // Convert backend enum response to frontend string array format
    return {
      ...responseData,
      staffTypes: Array.isArray(responseData.staffTypes)
        ? responseData.staffTypes.map((type: any) =>
            typeof type === "string" ? type : type.toString()
          )
        : [],
    };
  },
};
