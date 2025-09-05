package com.thivinu.inventoryapi.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Persisted as 'name' in DB; DTO handles "category_name" on the wire
    @Column(nullable = false, unique = true)
    private String name;

    // Optional image URL for category cover/icon
    @Column(name = "image_url", length = 1024)
    private String imageUrl;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    @JsonBackReference
    private List<InventoryItem> items; // assumes you already have InventoryItem with a 'category' field
}