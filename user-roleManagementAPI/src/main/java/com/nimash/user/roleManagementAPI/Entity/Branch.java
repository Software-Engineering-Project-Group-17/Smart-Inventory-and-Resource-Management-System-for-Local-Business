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
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;
    
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
    
    public void setManager(User manager) {
        this.manager = manager;
    }
    
    public void setOwner(User owner) {
        this.owner = owner;
    }
    
    public void setStatus(BranchStatus status) {
        this.status = status;
    }
    
    // Explicit getters for JSON serialization
    public Long getId() {
        return id;
    }
    
    public String getName() {
        return name;
    }
    
    public String getLocation() {
        return location;
    }
    
    public String getContactNumber() {
        return contactNumber;
    }
    
    public String getDescription() {
        return description;
    }
    
    public BranchStatus getStatus() {
        return status;
    }
    
    public User getManager() {
        return manager;
    }
    
    public User getOwner() {
        return owner;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
