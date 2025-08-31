package com.nimash.user.roleManagementAPI.Dto;

import lombok.Data;

@Data
public class CreateOwnerRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String secretKey;
    
    // Explicit getters to work around Lombok issues
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getRole() { return role; }
    public String getSecretKey() { return secretKey; }
}
