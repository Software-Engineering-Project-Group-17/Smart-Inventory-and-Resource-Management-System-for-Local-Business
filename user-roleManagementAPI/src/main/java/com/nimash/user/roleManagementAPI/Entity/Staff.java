package com.nimash.user.roleManagementAPI.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Staff {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    private String address;
    
    private String tel;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager; // The branch manager who created this staff
    
    // New fields matching the updated database schema
    @Column(name = "salary")
    private BigDecimal salary;
    
    // PostgreSQL array support for staff_types
    @Column(name = "staff_types", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Builder.Default
    private String[] staffTypes = new String[0];
    
    @Column(name = "hire_date", nullable = false, columnDefinition = "TIMESTAMPTZ DEFAULT now()")
    private LocalDateTime hireDate;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    // Remove the old StaffType enum - no longer needed
    
    // Explicit setters to work around Lombok issues
    public void setUser(User user) { this.user = user; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setEmail(String email) { this.email = email; }
    public void setAddress(String address) { this.address = address; }
    public void setTel(String tel) { this.tel = tel; }
    public void setBranch(Branch branch) { this.branch = branch; }
    public void setManager(User manager) { this.manager = manager; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }
    public void setStaffTypes(Set<String> staffTypes) { 
        this.staffTypes = staffTypes != null ? staffTypes.toArray(new String[0]) : new String[0];
    }
    public void setStaffTypesArray(String[] staffTypes) {
        this.staffTypes = staffTypes != null ? staffTypes : new String[0];
    }
    public void setHireDate(LocalDateTime hireDate) { this.hireDate = hireDate; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    // Explicit getters to work around Lombok issues
    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getAddress() { return address; }
    public String getTel() { return tel; }
    public User getManager() { return manager; }
    public Branch getBranch() { return branch; }
    public User getUser() { return user; }
    public Set<String> getStaffTypes() { 
        if (staffTypes != null && staffTypes.length > 0) {
            Set<String> result = new HashSet<>();
            for (String type : staffTypes) {
                if (type != null && !type.trim().isEmpty()) {
                    result.add(type);
                }
            }
            return result;
        }
        return new HashSet<>();
    }
    public String[] getStaffTypesArray() {
        return staffTypes != null ? staffTypes : new String[0];
    }
    public BigDecimal getSalary() { return salary; }
    public LocalDateTime getHireDate() { return hireDate; }
    public Boolean getIsActive() { return isActive; }
}
