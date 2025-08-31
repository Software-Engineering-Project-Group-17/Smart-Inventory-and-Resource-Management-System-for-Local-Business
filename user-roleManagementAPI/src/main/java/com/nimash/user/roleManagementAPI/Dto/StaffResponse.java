package com.nimash.user.roleManagementAPI.Dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String address;
    private String tel;
    private Set<String> staffTypes;
    private BigDecimal salary;
    private Long branchId;
    private String branchName;
    private Long managerId;
    private String managerName;
    private String userFirebaseUid;
    
    // Explicit setters to work around Lombok issues
    public void setId(Long id) { this.id = id; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setEmail(String email) { this.email = email; }
    public void setAddress(String address) { this.address = address; }
    public void setTel(String tel) { this.tel = tel; }
    public void setStaffTypes(Set<String> staffTypes) { this.staffTypes = staffTypes; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public void setBranchName(String branchName) { this.branchName = branchName; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }
    public void setManagerName(String managerName) { this.managerName = managerName; }
    public void setUserFirebaseUid(String userFirebaseUid) { this.userFirebaseUid = userFirebaseUid; }
}
