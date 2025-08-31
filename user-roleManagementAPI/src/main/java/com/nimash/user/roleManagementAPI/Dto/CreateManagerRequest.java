package com.nimash.user.roleManagementAPI.Dto;

import lombok.Data;

@Data
public class CreateManagerRequest {
    private String creatorFirebaseUid; // Firebase UID of the owner creating this manager
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    private Long branchId;
    
    // Explicit getters to work around Lombok issues
    public String getCreatorFirebaseUid() { return creatorFirebaseUid; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getAddress() { return address; }
    public Long getBranchId() { return branchId; }
}
