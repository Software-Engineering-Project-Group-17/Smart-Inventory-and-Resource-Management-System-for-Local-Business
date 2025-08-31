package com.example.customerservice.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "customers")
public class Customer {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_tel")
    private String customerTel;

    private String address;

    @Column(name = "loyalty_points")
    private Long loyaltyPoints;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "customer_email")
    private String customerEmail;

    @PrePersist
    void prePersist() {
        if (createdDate == null) createdDate = LocalDateTime.now();
        if (loyaltyPoints == null) loyaltyPoints = 0L;
    }
}
