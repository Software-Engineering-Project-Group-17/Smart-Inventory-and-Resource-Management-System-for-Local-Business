export interface StaffType {
  id: string;
  name: string;
  color: string;
}

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  salary: number;
  remainingLeave: number;
}

export type Role = "owner" | "manager" | "staff";