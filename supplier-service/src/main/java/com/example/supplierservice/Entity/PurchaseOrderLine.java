package com.example.supplierservice.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity @Table(name="purchase_order_lines")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurchaseOrderLine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="po_id")
    private PurchaseOrder purchaseOrder;

    private Long itemId;
    private String itemName;
    private Integer quantity;
    private BigDecimal unitPrice;
}
