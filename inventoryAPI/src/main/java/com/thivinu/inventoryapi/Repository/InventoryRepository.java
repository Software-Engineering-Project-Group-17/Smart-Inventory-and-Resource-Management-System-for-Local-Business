package com.thivinu.inventoryapi.Repository;

import com.thivinu.inventoryapi.Entity.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    @Query("""
           SELECT i FROM InventoryItem i 
           WHERE (:category IS NULL OR i.category.name = :category)
           AND (:keyword IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%')) 
                OR LOWER(i.supplier) LIKE LOWER(CONCAT('%', :keyword, '%')))
           """)
    Page<InventoryItem> searchAndFilter(String category, String keyword, Pageable pageable);

    //Get all items where quantity < threshold
    @Query("SELECT i FROM InventoryItem i WHERE i.quantity < i.threshold")
    List<InventoryItem> findLowStockItems();
}

