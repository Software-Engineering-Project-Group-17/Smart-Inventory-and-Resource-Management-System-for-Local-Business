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
