package com.nimash.user.roleManagementAPI.Dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerCreationRequest {
    
    private String firstName;
    private String lastName;
    private String email;
    private String address;
    private String tel;
    private Long branchId;
}
