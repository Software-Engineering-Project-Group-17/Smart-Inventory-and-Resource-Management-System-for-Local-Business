package com.thivinu.inventoryapi.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Entity
@Table(name = "categories")
@RequiredArgsConstructor
@AllArgsConstructor
@NoArgsConstructor
@Setter
public class Category {
    // Getters & Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<InventoryItem> items;
}
