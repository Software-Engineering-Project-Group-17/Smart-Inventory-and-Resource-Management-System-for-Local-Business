export interface Resource {
  id: number;
  name: string;
  details: string;
  isAvailable: boolean;
}

export interface Assignment {
  id: number;
  resourceId: number;
  resourceName: string;
  email: string;
  staffName: string;
  phone: string;
  purpose: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface StaffMember {
  email: string;
  name: string;
  phone: string;
}

export interface AssignmentFormData {
  staffId?: number;
  email: string;
  staffName: string;
  phone: string;
  purpose: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface ResourceFormData {
  name: string;
  details: string;
}

export type TabType = "available" | "assigned";
