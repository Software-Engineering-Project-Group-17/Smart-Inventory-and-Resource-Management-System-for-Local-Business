package com.nimash.user.roleManagementAPI.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private Role_Type role;
    
    private String description;
    
    public String name() {
        return role.name();
    }
    
    public void setRole(Role_Type role) {
        this.role = role;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    // Explicit getters for JSON serialization
    public Long getId() {
        return id;
    }
    
    public Role_Type getRole() {
        return role;
    }
    
    public String getDescription() {
        return description;
    }
    
    public enum Role_Type{
        OWNER,
        MANAGER,
        RESOURCE_MANAGER,
        INVENTORY_MANAGER,
        SALES_MANAGER,
        STAFF,
        SUPPLIER,
        CUSTOMER
    }
}
