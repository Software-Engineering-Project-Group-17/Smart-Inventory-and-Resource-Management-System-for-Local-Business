package com.thivinu.inventoryapi.Repository;

import com.thivinu.inventoryapi.Entity.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

    @Query("""
        SELECT i FROM InventoryItem i
        WHERE (:category IS NULL OR LOWER(i.category.name) = LOWER(:category))
          AND (
                :keyword IS NULL
             OR  LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR  LOWER(i.sku)  LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR  LOWER(i.unit) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        """)
    Page<InventoryItem> searchAndFilter(@Param("category") String category,
                                        @Param("keyword") String keyword,
                                        Pageable pageable);

    @Query("SELECT i FROM InventoryItem i WHERE i.quantity < i.threshold")
    List<InventoryItem> findLowStockItems();
}