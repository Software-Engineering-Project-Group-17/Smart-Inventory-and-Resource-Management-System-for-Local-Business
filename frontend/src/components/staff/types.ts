// Types and interfaces for staff management
export interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  types: string[];
  salary: number;
  remainingLeave: number;
  isActive: boolean;
}

export interface StaffType {
  id: string;
  name: string;
  color: string;
}

export interface NewStaffMember {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  types: string[];
  salary: number;
}

export interface NotificationState {
  show: boolean;
  message: string;
  type: "success" | "error";
}
