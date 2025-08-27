package com.example.supplierservice.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="supplier_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SupplierItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="supplier_id")
    private Supplier supplier;

    private Long itemId;
    private String itemName;
}
