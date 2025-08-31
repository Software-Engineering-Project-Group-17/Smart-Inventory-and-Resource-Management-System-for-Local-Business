package com.nimash.user.roleManagementAPI.Entity;

import jakarta.persistence.*;
import lombok.*;

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
    
    @Enumerated(EnumType.STRING)
    @Column(name = "staff_role", nullable = false)
    private StaffRole staffRole;
    
    public enum StaffRole {
        INVENTORY_MANAGER("inventory_manager"),
        RESOURCE_MANAGER("resource_manager"), 
        SALES_MANAGER("sales_manager"),
        STAFF("staff");
        
        private final String value;
        
        StaffRole(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
    
    // Explicit setters to work around Lombok issues
    public void setUser(User user) { this.user = user; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setEmail(String email) { this.email = email; }
    public void setAddress(String address) { this.address = address; }
    public void setTel(String tel) { this.tel = tel; }
    public void setBranch(Branch branch) { this.branch = branch; }
    public void setStaffRole(StaffRole staffRole) { this.staffRole = staffRole; }
    public void setManager(User manager) { this.manager = manager; }
    
    // Explicit getters to work around Lombok issues
    public Branch getBranch() { return branch; }
    public User getUser() { return user; }
    public StaffRole getStaffRole() { return staffRole; }
}
