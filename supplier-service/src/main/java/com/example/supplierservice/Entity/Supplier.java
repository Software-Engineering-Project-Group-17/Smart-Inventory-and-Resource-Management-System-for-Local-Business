package com.example.supplierservice.Entity;

import com.example.supplierservice.Entity.SupplierItem;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "supplier_name", nullable = false)
    private String supplierName;

    @Column(name = "supplier_tel")
    private String supplierTel;

    private String address;

    @Column(name = "supplier_email")
    private String supplierEmail;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SupplierItem> items = new HashSet<>();

    @PrePersist
    void prePersist() {
        if (createdDate == null) createdDate = LocalDateTime.now();
    }
}
