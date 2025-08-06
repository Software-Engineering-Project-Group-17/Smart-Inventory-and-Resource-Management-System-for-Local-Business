package com.nimash.user.roleManagementAPI.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BranchRequest {
    @NotBlank(message = "Branch name is required")
    private String name;
    @NotBlank(message = "Branch location is required")
    private String location;
    @NotBlank(message = "Branch contactNumber is required")
    private String contactNumber;
    @NotBlank(message = "Branch description is required")
    private String description; // optional
}
