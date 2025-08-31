package com.nimash.user.roleManagementAPI.Dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffCreationRequest {
    
    private String firstName;
    private String lastName;
    private String email;
    private String address;
    private String tel;
    private String role; // branch, inventory, resource, sales, normal_employee
    private Long branchId;
}
