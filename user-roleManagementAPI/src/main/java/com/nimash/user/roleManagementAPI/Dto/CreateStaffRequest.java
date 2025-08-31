package com.nimash.user.roleManagementAPI.Dto;

import com.nimash.user.roleManagementAPI.Entity.Staff;
import lombok.Data;

@Data
public class CreateStaffRequest {
    private String creatorFirebaseUid; // Firebase UID of the branch manager creating this staff
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    private Staff.StaffRole staffRole; // Specific role within the branch
    
    // Explicit getters to work around Lombok issues
    public String getCreatorFirebaseUid() { return creatorFirebaseUid; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getAddress() { return address; }
    public Staff.StaffRole getStaffRole() { return staffRole; }
}
