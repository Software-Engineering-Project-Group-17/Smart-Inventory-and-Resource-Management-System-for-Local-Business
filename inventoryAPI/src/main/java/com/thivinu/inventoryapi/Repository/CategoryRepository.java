package com.thivinu.inventoryapi.Repository;

import com.thivinu.inventoryapi.Entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Category findByName(String name); // To search category by name
}
