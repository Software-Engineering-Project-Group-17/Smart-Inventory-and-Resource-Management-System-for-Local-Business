package com.example.supplierservice.Repository;

import com.example.supplierservice.Entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {}
