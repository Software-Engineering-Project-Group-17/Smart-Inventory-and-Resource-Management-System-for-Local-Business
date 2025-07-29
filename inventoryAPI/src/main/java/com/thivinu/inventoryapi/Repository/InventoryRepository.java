package com.thivinu.inventoryapi.Repository;

import com.thivinu.inventoryapi.Entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
}
