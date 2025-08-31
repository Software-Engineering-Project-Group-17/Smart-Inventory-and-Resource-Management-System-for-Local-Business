package com.nimash.user.roleManagementAPI.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "owner")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Owner {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String name;
    
    // Static builder method to work around Lombok issues
    public static Owner builder() {
        return new Owner();
    }
    
    // Builder-style methods
    public Owner user(User user) { this.user = user; return this; }
    public Owner name(String name) { this.name = name; return this; }
    public Owner build() { return this; }
    
    // Explicit getters
    public String getName() { return name; }
    public User getUser() { return user; }
}
