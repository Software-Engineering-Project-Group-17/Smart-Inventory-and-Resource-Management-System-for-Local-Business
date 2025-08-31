package com.nimash.user.roleManagementAPI.Dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OwnerCreationRequest {
    
    private String name;
    private String email;
    private String secretKey;
}
