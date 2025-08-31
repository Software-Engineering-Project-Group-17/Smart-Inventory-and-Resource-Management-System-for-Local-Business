export interface StaffMember {
  id: string;
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