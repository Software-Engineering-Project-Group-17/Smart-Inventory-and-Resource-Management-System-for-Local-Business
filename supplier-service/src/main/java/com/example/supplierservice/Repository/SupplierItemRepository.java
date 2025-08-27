package com.example.supplierservice.Repository;

import com.example.supplierservice.Entity.SupplierItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupplierItemRepository extends JpaRepository<SupplierItem, Long> {
    List<SupplierItem> findBySupplierId(Long supplierId);
}
