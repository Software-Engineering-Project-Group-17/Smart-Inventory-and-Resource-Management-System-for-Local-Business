package com.nimash.user.roleManagementAPI.Dto;

public class AdminUserCreationRequest {
    
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String role; // OWNER, MANAGER, STAFF
    private Long branchId; // Required for MANAGER and STAFF
    
    // Getters
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getRole() { return role; }
    public Long getBranchId() { return branchId; }
    
    // Setters
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setRole(String role) { this.role = role; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
}
