package com.nimash.user.roleManagementAPI.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "branches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String location;
    private String contactNumber;
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = true) // Make nullable for existing data
    @Builder.Default
    private BranchStatus status = BranchStatus.ACTIVE;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = true) // Make nullable for existing data
    private LocalDateTime createdAt;
    
    public enum BranchStatus {
        ACTIVE,
        INACTIVE
    }
    
    // Setters for backwards compatibility
    public void setName(String name) {
        this.name = name;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}
