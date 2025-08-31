export interface Resource {
  id: string;
  name: string;
  details: string;
  isAvailable: boolean;
}

export interface Assignment {
  id: string;
  resourceId: string;
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