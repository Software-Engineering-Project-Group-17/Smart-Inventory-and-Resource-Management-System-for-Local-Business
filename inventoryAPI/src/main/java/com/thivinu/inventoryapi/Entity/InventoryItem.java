package com.thivinu.inventoryapi.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String sku;

    private int quantity;

    private String unit;

    @Column(name = "cost_price_per_unit")
    private double costPricePerUnit;

    @Column(name = "selling_price_per_unit")
    private double sellingPricePerUnit;

    @Column(nullable = false)
    private int threshold;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    @JsonBackReference
    private Category category;

    @Column(name = "branch_id", nullable = false)
    private Integer branchId;   // resolved using user_id via BranchService
}