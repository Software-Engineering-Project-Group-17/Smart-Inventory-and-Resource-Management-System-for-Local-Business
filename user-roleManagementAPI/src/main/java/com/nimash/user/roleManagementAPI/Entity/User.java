package com.nimash.user.roleManagementAPI.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "\"user\"") // Quoted because user is a reserved keyword in PostgreSQL
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "firebase_uid", nullable = false, unique = true)
    private String firebaseUid;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    private String name;
    
    @Column(name = "password_hash")
    private String passwordHash;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @Column(name = "profile_pic_url")
    private String profilePicUrl;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    // Role relationship
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = true) // Make nullable for existing data
    private Role role;
    
    // Track who created this user (for controlled signup)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    // Account status for better user management
    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.ACTIVE;
    
    // Flag to indicate if they need to change password on first login
    @Column(name = "temp_password")
    @Builder.Default
    private Boolean tempPassword = false;
    
    public enum AccountStatus {
        ACTIVE,
        INACTIVE, 
        SUSPENDED,
        PENDING_ACTIVATION
    }
    
    // Explicit getters to work around Lombok issues
    public Long getUserId() { return userId; }
    public String getFirebaseUid() { return firebaseUid; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public Boolean getIsActive() { return isActive; }
    public String getProfilePicUrl() { return profilePicUrl; }
    public Role getRole() { return role; }
    public Boolean getTempPassword() { return tempPassword; }
    
    // Explicit setters to work around Lombok issues
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setFirebaseUid(String firebaseUid) { this.firebaseUid = firebaseUid; }
    public void setEmail(String email) { this.email = email; }
    public void setName(String name) { this.name = name; }
    public void setRole(Role role) { this.role = role; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    
    // Static builder method to work around Lombok issues
    public static User builder() {
        return new User();
    }
    
    // Builder-style methods
    public User firebaseUid(String firebaseUid) { this.firebaseUid = firebaseUid; return this; }
    public User email(String email) { this.email = email; return this; }
    public User name(String name) { this.name = name; return this; }
    public User passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
    public User role(Role role) { this.role = role; return this; }
    public User isActive(Boolean isActive) { this.isActive = isActive; return this; }
    public User build() { return this; }
}
