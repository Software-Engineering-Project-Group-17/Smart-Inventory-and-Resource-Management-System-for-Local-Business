package com.nimash.user.roleManagementAPI.Dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Set;
import java.util.HashSet;

@Data
public class CreateStaffRequest {
    private String creatorFirebaseUid; // Firebase UID of the branch manager creating this staff
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    private Set<String> staffTypes = new HashSet<>(); // Updated to match new schema
    private BigDecimal salary;
    
    // Explicit getters to work around Lombok issues
    public String getCreatorFirebaseUid() { return creatorFirebaseUid; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getAddress() { return address; }
    public Set<String> getStaffTypes() { return staffTypes; }
    public BigDecimal getSalary() { return salary; }
}
