import { StaffMember } from '@/types/Resources';

// Mock database of staff members
export const staffDatabase: StaffMember[] = [
  { email: 'john.doe@example.com', name: 'John Doe', phone: '+94 77 123 4567' },
  { email: 'jane.smith@example.com', name: 'Jane Smith', phone: '+94 77 234 5678' },
  { email: 'mike.wilson@example.com', name: 'Mike Wilson', phone: '+94 77 345 6789' },
  { email: 'sarah.brown@example.com', name: 'Sarah Brown', phone: '+94 77 456 7890' },
  { email: 'david.lee@example.com', name: 'David Lee', phone: '+94 77 567 8901' }
];

export const fetchStaffDetails = async (email: string): Promise<StaffMember | null> => {
  if (!email || !email.includes('@')) return null;
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const staffMember = staffDatabase.find(staff => 
    staff.email.toLowerCase() === email.toLowerCase()
  );
  
  return staffMember || null;
};