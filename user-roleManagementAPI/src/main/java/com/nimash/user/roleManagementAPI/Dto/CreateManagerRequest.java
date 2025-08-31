package com.nimash.user.roleManagementAPI.Dto;

import lombok.Data;

@Data
public class CreateManagerRequest {
    private String creatorFirebaseUid; // Firebase UID of the admin creating this manager
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    private Long branchId;
}
